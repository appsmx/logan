# Guía de Integración — Módulo Asistente IA

> Paso a paso: cómo instanciar este módulo en un producto LOGAN OS (Mr. Trámite, Mariscos Quiroa, futuros productos).

---

## Resumen del flujo

```
[Cliente WhatsApp] → [Meta Cloud API] → [Webhook en producto]
                                              ↓
                                     [POST /api/assistant/chat]  ← LOGAN OS app
                                              ↓
                                     [Z.ai SDK + Biblia context]
                                              ↓
                                     [Texto de respuesta]
                                              ↓
                                     [POST a Meta Cloud API]
                                              ↓
                                     [Cliente recibe respuesta por WhatsApp]
```

Tres piezas:
1. **App de Meta** (WhatsApp Cloud API) — configuración en Meta for Developers.
2. **Webhook handler** — copiado de `webhook-handler-template.ts` en el repo del producto.
3. **Endpoint `/api/assistant/chat`** — vive en LOGAN OS app (o desplegable aparte).

---

## Paso 1 — Completar la Biblia del producto en LOGAN OS

Antes de instanciar el bot, la Biblia del producto debe tener:

- ✅ **Visión** — qué es el producto, qué ofrece.
- ✅ **Usuarios / audiencia objetivo** — a quién le habla el bot.
- ✅ **Catálogo de productos/servicios** — qué vende / ofrece.
- ✅ **Precios** — rango de precios, mayoreo/menudeo, etc.
- ✅ **FAQ** — preguntas frecuentes que el bot debe poder responder.
- ✅ **Procesos clave** — cómo subir documentos, cómo cotizar, cómo agendar.
- ✅ **Datos de contacto del producto** — WhatsApp y email del producto (no LOGAN).

**Dónde editar:** LOGAN OS app → proyecto → sección Biblia → estado.

> 💡 **Sugerencia:** meter el catálogo, precios, FAQ y procesos en el campo `vision` (markdown multilínea) hasta que la Biblia tenga campos separados. La implementación de referencia (`src/lib/assistant/system-prompt.ts`) trata el campo `vision` como el contexto Biblia completo.

Ver `example-biblia-context.md` para un ejemplo concreto.

---

## Paso 2 — Crear la app en Meta for Developers

1. Ir a https://developers.facebook.com/ → "Crear aplicación" → tipo "Business".
2. Añadir el producto **WhatsApp Cloud API**.
3. En **Configuration → WhatsApp API Setup**:
   - Anotar **Phone Number ID**.
   - Anotar el **token temporal** (luego crear uno permanente).
4. En **Configuration → Webhook**:
   - Callback URL: `https://<producto>.mx/api/whatsapp/webhook`
   - Verify Token: una cadena arbitraria que TU definas (ej. `logan_verify_mrtramite_2026`).
   - Suscribirse al campo **messages**.
5. En **App Settings → Basic**:
   - Anotar **App Secret** (es lo que se usa para verificar la firma del webhook).

> ⚠️ Para producción, la app debe estar en modo "Live" (requiere verificación de negocio de Meta). En modo "Sandbox" solo permite mensajes a números de prueba.

---

## Paso 3 — Variables de entorno del producto

Crear `.env` en el repo del producto:

```bash
# ─── WhatsApp Cloud API (Meta) ──────────────────────────
WHATSAPP_TOKEN=EAAG...                          # token permanente de la app
PHONE_NUMBER_ID=106...                          # Phone Number ID de Meta
APP_SECRET=abc123...                            # App Secret de la app
WEBHOOK_VERIFY_TOKEN=logan_verify_producto_2026 # el que definiste en Meta

# ─── Conexión al LOGAN OS app ───────────────────────────
ASSISTANT_API_BASE=http://localhost:3000        # URL del LOGAN OS app
ASSISTANT_PROJECT_ID=cmsll0amf...               # projectId en LOGAN OS para este producto

# ─── Datos del producto (para escalar) ──────────────────
PRODUCT_WHATSAPP=https://wa.me/5215512345678    # WhatsApp del producto
PRODUCT_EMAIL=hola@producto.mx                   # email del producto
```

> **NUNCA** commitear `.env`. Solo `.env.example`.

---

## Paso 4 — Desplegar el webhook handler

1. Copiar `templates/asistente-ia/webhook-handler-template.ts` al repo del producto, en `src/app/api/whatsapp/webhook/route.ts` (si es Next.js) o equivalente.

2. Asegurarse de que el runtime soporta `crypto` de Node (Next.js 16 con `runtime: "nodejs"` en el route — el default).

3. Para Next.js, agregar al inicio del archivo:
   ```ts
   export const runtime = "nodejs";
   export const dynamic = "force-dynamic";
   ```

4. Desplegar en una URL pública HTTPS. Vercel, railway, fly.io, o el hosting del producto (DEC-LOGAN-005 / DEC-LOGAN-012).

5. Verificar que `GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=abc` devuelve `abc` con status 200.

---

## Paso 5 — Configurar el webhook en Meta

En Meta for Developers → tu app → WhatsApp → Configuration → Webhook:

1. **Callback URL:** `https://<producto>.mx/api/whatsapp/webhook`
2. **Verify Token:** el valor de `WEBHOOK_VERIFY_TOKEN`.
3. Click **Verify and Save**. Si todo está bien, Meta hace un GET y debe recibir 200 con el challenge.
4. En **Webhook Fields**, suscribirse a **messages** (y opcionalmente `message_status` si quieres recibir delivered/read receipts).

---

## Paso 6 — Probar end-to-end

1. Asegurarse de que el LOGAN OS app esté corriendo (con `ASSISTANT_PROJECT_ID` correcto).

2. **Probar el endpoint directamente primero** (sin WhatsApp):
   ```bash
   curl -X POST http://localhost:3000/api/assistant/chat \
     -H 'Content-Type: application/json' \
     -d '{"projectId":"<id>","message":"Hola, ¿qué productos tienen?","sessionId":"test-1"}'
   ```
   Debe devolver una respuesta en español, en la voz del producto.

3. **Probar vía WhatsApp** (sandbox primero, producción después):
   - En modo Sandbox, solo números de prueba permitidos. Añadir tu teléfono como número de prueba en Meta.
   - Enviar un WhatsApp al número conectado: "Hola".
   - Debes recibir una respuesta del bot en menos de 5 segundos.
   - Probar continuidad: "Me llamo Juan" → "¿Cómo me llamo?" → debe decir "Juan".

4. **Probar escalación:**
   - Enviar: "Necesito hablar con un humano, es urgente".
   - El bot debe responder con el WhatsApp y email del producto.

5. **Probar rate limit:**
   - Enviar 21 mensajes seguidos con el mismo número.
   - El mensaje 21 debe recibir: "Has alcanzado el límite de 20 mensajes en esta sesión..."

---

## Paso 7 — Personalizar el system prompt (opcional)

La implementación de referencia construye el system prompt automáticamente desde la Biblia. Para personalizarlo:

1. La función está en `src/lib/assistant/system-prompt.ts` (`buildAssistantSystemPrompt`).
2. Recibe `ProjectBibliaContext` (nombre, visión, usuarios, etc.).
3. Para productos con necesidades específicas, se puede extender la función con campos adicionales (catálogo, FAQ, procesos) leídos de la Biblia.
4. La **voz del producto** se infiere del nombre + visión (ej. "Mariscos Quiroa" → tono cercano y enérgico; "Mr. Trámite" → tono cálido y profesional).

> **Art. III (simplicidad):** empezar con el template por defecto. Solo personalizar cuando la voz genérica no funcione para el producto.

---

## Paso 8 — Producción

Antes de salir a producción:

1. **App de Meta en modo Live** (verificación de negocio requerida).
2. **Token permanente** (no el temporal de prueba).
3. **URL del webhook con HTTPS** (Vercel lo da automático).
4. **Monitoreo:** configurar alertas para:
   - Webhook que responde > 5s (Meta reintenta si > 30s, mejor prevenir).
   - Errores 503 del endpoint /api/assistant/chat.
   - Errores 4xx al enviar respuesta a Meta.
5. **Logs:** guardar `wa_id` + `message` + `response` (sin token) para auditoría y mejora del bot.
6. **Opt-in del cliente:** WhatsApp Cloud API requiere que el cliente haya escrito primero (opt-in implícito). No puedes iniciar conversaciones a menos que uses templates aprobados por Meta.

---

## Checklist de instanciación

- [ ] Biblia del producto completa (visión, usuarios, catálogo, precios, FAQ, procesos, contacto).
- [ ] App de Meta creada + WhatsApp Cloud API añadido.
- [ ] Variables de entorno configuradas (`.env` en el repo del producto).
- [ ] Webhook handler copiado y desplegado en HTTPS público.
- [ ] Webhook verificado en Meta (GET devuelve 200 con challenge).
- [ ] Suscripción al campo **messages** activa.
- [ ] Pruebas end-to-end: conversación, continuidad de sesión, escalación, rate limit.
- [ ] App de Meta en modo Live (verificación de negocio).
- [ ] Token permanente (no temporal).
- [ ] Logs + monitoreo configurados.

---

## Ejemplo concreto: Mariscos Quiroa

Proyecto ya existe en LOGAN OS (`cmsll0amf000sndyiwmi0bf7n`).

**Biblia actual** (en `vision`):
- "Distribuidora de pescados y mariscos frescos en Rosarito, Baja California."
- Catálogo: 8 productos, switch mayoreo/menudeo.
- Audiencia: restaurantes y comercios locales de Baja California.

**Para instanciar el bot:**

1. **Completar la Biblia** con: catálogo detallado (8 productos con precios mayoreo/menudeo), FAQ, datos de contacto de Mariscos Quiroa (WhatsApp/email reales).

2. **Crear app de Meta** "Mariscos Quiroa WhatsApp" → WhatsApp Cloud API.

3. **Variables de entorno:**
   ```bash
   WHATSAPP_TOKEN=EAAG...
   PHONE_NUMBER_ID=...
   APP_SECRET=...
   WEBHOOK_VERIFY_TOKEN=logan_verify_mariscos_jona_2026
   ASSISTANT_API_BASE=https://logan-os.vercel.app   # o donde esté LOGAN OS
   ASSISTANT_PROJECT_ID=cmsll0amf000sndyiwmi0bf7n
   PRODUCT_WHATSAPP=https://wa.me/526611234567
   PRODUCT_EMAIL=ventas@mariscosquiroa.com
   ```

4. **Desplegar webhook** en el repo `mariscosquiroa` (Vercel).

5. **Verificar webhook** en Meta + suscribirse a `messages`.

6. **Probar:** WhatsApp desde un teléfono al número conectado.

> **Tiempo estimado de instanciación:** 2-4 horas (la mayor parte es configuración en Meta + completar la Biblia). El código del bot en sí es copiar el template.

---

## Ejemplo concreto: Mr. Trámite

Proyecto ya existe en LOGAN OS (`cmslgu1ew0000ndgeb08qgp32`).

**Para instanciar el bot:**

1. **Completar la Biblia** con: tipos de trámite (gubernamentales, empresariales, personales), precio ($800 MXN post-servicio), FAQ, datos de contacto, proceso de onboarding del cliente.

2. **Crear app de Meta** "Mr. Trámite WhatsApp".

3. **Variables de entorno:** análogas a Mariscos Quiroa, con `ASSISTANT_PROJECT_ID=cmslgu1ew0000ndgeb08qgp32`.

4. **Desplegar webhook** en el repo `mrtramite`.

5. **Probar:** el bot debe poder responder preguntas sobre tipos de trámite, precio, proceso de inicio, y escalar a humano cuando el cliente quiera cerrar una venta real.

> **Caso de uso típico:** cliente escribe "¿Cuánto cuesta gestionar una licencia de conducir?" → bot responde "$800 MXN post-servicio, cubre trámites vehiculares. Para iniciar te necesitamos..." → cliente: "Quiero iniciar" → bot: "Para iniciar tu trámite con un asesor humano, escríbele a <whatsapp>".

---

## Preguntas frecuentes de integración

**¿El bot puede manejar imágenes o audio?**
El template por defecto solo soporta texto. Para extenderlo, modificar el webhook handler para manejar `type: "image"`, `type: "audio"`, etc., y pasar el contenido al endpoint del asistente.

**¿Puedo tener varios productos en un solo LOGAN OS app?**
Sí. El `projectId` distingue de qué producto se está hablando. Cada producto tiene su propio webhook handler (en su propio repo) que llama a `/api/assistant/chat` con su `projectId` correspondiente.

**¿La sesión se pierde al reiniciar el LOGAN OS app?**
Sí. La sesión es en memoria. Aceptable para WhatsApp (los clientes esperan sesiones cortas). Para persistencia real, reemplazar `src/lib/assistant/session-store.ts` con una implementación Redis.

**¿Cuánto cuesta operar el bot?**
- Z.ai SDK: free tier (DEC-LOGAN-006).
- WhatsApp Cloud API: gratis las primeras 1000 conversaciones/mes, luego ~$0.05 USD por conversación.
- Hosting del webhook + LOGAN OS: Vercel Pro $20/mes (DEC-LOGAN-013).

**¿Cómo mejoro las respuestas del bot?**
- Completar más la Biblia (catálogo detallado, FAQ, procesos).
- Revisar logs de conversaciones (sin PII sensible).
- Ajustar el system prompt para casos edge.

---

## Soporte

Este módulo es parte de LOGAN OS. Problemas o dudas → resolver via metodología LOGAN (Hipótesis → Verificación → Aprendizaje).
