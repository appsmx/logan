# Guía de Setup Meta Business Suite Multi-canal

> **Para:** Mariscos Quiroa (primer piloto LOGAN)
> **Metodología:** LOGAN v1.0 — Art. II (documentación precede al desarrollo)
> **Objetivo:** Configurar una sola app de Meta Business que exponga **Facebook Messenger + Instagram DM + WhatsApp Cloud API** apuntando a un solo webhook en `https://mariscosquiroa.com/api/meta/webhook`.
> **Tiempo estimado:** 2-3 horas de trabajo + 5-10 días hábiles de App Review (paralelo).

---

## Resumen del flujo

```
   Página Facebook  ────────┐
   Cuenta IG Business  ────┼──→ Meta App (Business)  ──→ Webhook mariscosquiroa.com
   WhatsApp Business  ─────┘         │
                                     ├─ META_APP_SECRET (compartido)
                                     ├─ META_VERIFY_TOKEN (compartido)
                                     ├─ WHATSAPP_ACCESS_TOKEN
                                     ├─ MESSENGER_PAGE_ACCESS_TOKEN
                                     └─ INSTAGRAM_ACCESS_TOKEN
```

**Requisitos:**
- Cuenta de Facebook personal (administrador del negocio).
- Acceso a Meta Business Suite (https://business.facebook.com).
- WhatsApp Business ya configurado (sesión anterior — `WHATSAPP_*` vars ya existen).
- Una página de Facebook publicada (si no existe, se crea aquí).
- Una cuenta de Instagram Business conectada a esa página.

---

## Paso 1 — Verificar/Crear página de Facebook

1. Ir a https://www.facebook.com/pages/creation/
2. Crear página tipo "Negocio local" → categoría "Mariscos y pescados" o "Distribuidora de alimentos".
3. Nombre: **Mariscos Quiroa** (igual al del sitio).
4. Completar:
   - Foto de perfil (logo del negocio — pedir al dueño).
   - Foto de portada (puede ser producto fresco).
   - Bio: "Distribuidora de pescados y mariscos frescos en Rosarito, Baja California. Mayoreo y menudeo."
   - WhatsApp: +52 663 699 9689 (el mismo número ya configurado en WhatsApp Business Cloud API).
   - Email y dirección (Rosarito, Baja California).
5. Publicar al menos 1 post de bienvenida.

> **Si ya existe la página:** saltar al paso 2. Verificar que tú seas administrador.

---

## Paso 2 — Convertir Instagram en cuenta Business

1. Si no tienes cuenta de Instagram: créala en la app móvil con el email del negocio.
2. En la app de Instagram → Ajustes → "Cambiar a cuenta profesional" → "Empresa".
3. Categoría: "Distribuidora de alimentos" o similar.
4. Conectar a la página de Facebook creada en el paso 1 (Instagram pedirá autorización).
5. Verificar que la cuenta ya es Business en Ajustes → "Tipo de cuenta".

> **Importante:** Instagram DM API solo funciona con cuentas Business, no Creator ni Personal.

---

## Paso 3 — Verificar/configurar Meta Business Suite

1. Ir a https://business.facebook.com/
2. Si no tienes Business Manager, crear uno:
   - Nombre: "Mariscos Quiroa" (igual al negocio).
   - Tu nombre y email.
3. En Business Settings → Business Info → verificar que el negocio esté verificado (META requiere verificación de negocio para producción).
4. En Business Settings → Accounts → Pages → Add → seleccionar la página del paso 1.
5. En Business Settings → Accounts → Instagram Accounts → Add → login con la cuenta IG Business del paso 2.
6. En Business Settings → Accounts → WhatsApp Business Accounts → ya debería estar el número +52 663 699 9689 (de la sesión anterior).

---

## Paso 4 — Verificar/Crear Meta App

1. Ir a https://developers.facebook.com/apps/
2. Si ya existe la app (de la sesión anterior de WhatsApp), úsala. Si no:
   - "Create App" → tipo "Business" → nombre "Mariscos Quiroa Multi-canal".
3. En la app → Settings → Basic:
   - **App ID** y **App Secret** → anotar (App Secret = `META_APP_SECRET`).
   - Display name: "Mariscos Quiroa".
   - App purpose: "Business".
   - Privacy Policy URL: `https://mariscosquiroa.com/privacidad`.
   - Terms of Service URL: `https://mariscosquiroa.com/terminos`.
   - (Crear estas 2 páginas en el sitio si no existen — sección legal obligatoria para Live).
4. En la app → Settings → Advanced → "Business Use Case": "Customer service".

---

## Paso 5 — Agregar productos a la app

En la app de Meta → Dashboard → "Add Product":

### 5.1 WhatsApp Cloud API (ya agregado en sesión anterior)
- Verificar que esté agregado.
- Anotar:
  - `WHATSAPP_ACCESS_TOKEN` (System User token permanente, ya configurado).
  - `WHATSAPP_PHONE_NUMBER_ID` (ya configurado).
  - `WHATSAPP_BUSINESS_ACCOUNT_ID` (ya configurado).

### 5.2 Messenger (Facebook Messenger)
- Click "Set Up" en Messenger.
- En "Access Tokens" → seleccionar la página del paso 1 → generar Page Access Token.
  - Anotar como `MESSENGER_PAGE_ACCESS_TOKEN`.
- Anotar `MESSENGER_PAGE_ID` (lo encuentras en la URL de la página, en `business.facebook.com` o en Page Info).
- Permisos/Features requeridos:
  - `pages_messaging` (automático al agregar).
  - `pages_messaging_subscriptions` (suscripción a mensajes recurrentes — opcional en fase 1).
  - `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata` (automáticos).

### 5.3 Instagram Messaging API
- Click "Set Up" en Instagram.
- En "Access Tokens" → seleccionar la cuenta IG Business del paso 2 (vinculada a la página del paso 1).
- Anotar `INSTAGRAM_ACCOUNT_ID` (lo ves en la configuración de la cuenta).
- El token a usar es el MISMO Page Access Token del paso 5.2 (Instagram usa el token de la página FB vinculada).
  - Anotar como `INSTAGRAM_ACCESS_TOKEN` (mismo valor que `MESSENGER_PAGE_ACCESS_TOKEN`).
- Permisos requeridos:
  - `instagram_basic` (automático).
  - `instagram_manage_messages` (**requiere App Review** para Live).
  - `instagram_content_publish` (opcional, si quieres que el bot publique — fuera de alcance fase 1).

---

## Paso 6 — Configurar webhook único

En la app de Meta → "WhatsApp" → "Configuration" → Webhook (ya configurado en sesión anterior):
- Callback URL: **cambiar a** `https://mariscosquiroa.com/api/meta/webhook` (antes era `/api/whatsapp/webhook`).
- Verify Token: el mismo que ya tenías (`META_VERIFY_TOKEN` — antes `WHATSAPP_VERIFY_TOKEN`).
- Suscribirse a: `messages`, `message_status` (igual que antes).

En la app de Meta → "Messenger" → "Webhooks":
- Callback URL: `https://mariscosquiroa.com/api/meta/webhook` (la misma).
- Verify Token: el mismo `META_VERIFY_TOKEN`.
- Click "Verify and Save".
- En "Webhook Fields" suscribir:
  - `messages` (mensajes entrantes).
  - `messaging_postbacks` (postbacks de botones persistentes — opcional en fase 1).
  - `message_deliveries` (recibos de entrega — opcional).
  - `message_reads` (recibos de lectura — opcional).

En la app de Meta → "Instagram" → "Webhooks":
- Callback URL: `https://mariscosquiroa.com/api/meta/webhook` (la misma).
- Verify Token: el mismo `META_VERIFY_TOKEN`.
- Click "Verify and Save".
- En "Webhook Fields" suscribir:
  - `messages` (mensajes DM entrantes).
  - `messaging_postbacks` (postbacks — opcional en fase 1).

> **Resultado:** los 3 productos apuntan a la misma URL. El handler distingue por `payload.object`.

---

## Paso 7 — App Review (para Live)

Para modo Live (producción, clientes reales — no solo administradores):

1. En Meta App → App Review → "Permissions and Features":
   - Verificar que `pages_messaging` esté disponible (lo es, no requiere review).
   - Solicitar **Advanced Access** para:
     - `pages_messaging` (a veces sí requiere review para cuentas nuevas).
     - `instagram_manage_messages` (casi siempre requiere review).
     - `pages_read_engagement` (para leer nombre del cliente en Messenger).
     - `pages_manage_metadata` (para manejar etiquetas de conversación).
2. Para cada permiso, llenar:
   - Caso de uso (en inglés o español): "Customer service chatbot for Mariscos Quiroa, a seafood distributor. The bot answers FAQs, helps with quotes, and escalates to a human when needed."
   - Demostración en video (Loom, 2-3 min) mostrando:
     - Cómo un cliente escribe por Messenger.
     - Cómo llega al webhook.
     - Cómo el bot responde.
     - Cómo escala a humano cuando no puede.
   - Capturas de pantalla del webhook log.
3. Submit y esperar 5-10 días hábiles. Meta te notifica por email.

> Mientras tanto, en modo Sandbox puedes probar con cuentas administradoras de la página.

---

## Paso 8 — Configurar variables de entorno

En Vercel → mariscosquiroa project → Settings → Environment Variables:

| Variable | Value | Environments |
|---|---|---|
| `META_APP_SECRET` | (App Secret de la app) | Production + Preview + Development |
| `META_VERIFY_TOKEN` | el token que definiste en paso 6 | Production + Preview + Development |
| `META_API_VERSION` | `v21.0` | Production + Preview + Development |
| `WHATSAPP_ACCESS_TOKEN` | (ya configurado) | (ya existe) |
| `WHATSAPP_PHONE_NUMBER_ID` | (ya configurado) | (ya existe) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | (ya configurado) | (ya existe) |
| `MESSENGER_PAGE_ACCESS_TOKEN` | (del paso 5.2) | Production + Preview + Development |
| `MESSENGER_PAGE_ID` | (del paso 5.2) | Production + Preview + Development |
| `INSTAGRAM_ACCESS_TOKEN` | (mismo que Messenger del paso 5.3) | Production + Preview + Development |
| `INSTAGRAM_ACCOUNT_ID` | (del paso 5.3) | Production + Preview + Development |
| `PRODUCT_INSTAGRAM` | `https://instagram.com/mariscosquiroa` | Production + Preview + Development |
| `PRODUCT_FACEBOOK` | `https://facebook.com/mariscosquiroa` | Production + Preview + Development |

> ⚠️ **Nunca** commitear el archivo `.env` real. Solo `.env.example` con valores placeholder.

---

## Paso 9 — Verificar el webhook (pruebas post-setup)

### 9.1 Verificación GET (Meta hace automáticamente al suscribir)
Al hacer click "Verify and Save" en Meta, Meta envía un GET a tu webhook. Si devuelve 200 + el challenge, la suscripción se activa. Si falla, Meta muestra el error.

### 9.2 Pruebas en modo Sandbox

#### WhatsApp (ya probado en sesión anterior)
- Desde tu teléfono (número administrador del negocio) escribir a +52 663 699 9689.
- El bot debe responder en español, en la voz de Mariscos Quiroa.

#### Facebook Messenger
- En la página de FB → "Enviar mensaje" (botón bajo la foto de portada).
- Escribir como administrador de la página (en modo Sandbox, solo admins pueden interactuar).
- El bot debe responder en Messenger en menos de 20 segundos.

#### Instagram DM
- En tu cuenta IG Business del paso 2 → mensaje directo (DM).
- Escribir como administrador.
- El bot debe responder en IG DM en menos de 20 segundos.

### 9.3 Verificar persistencia

```bash
# Después de las 3 pruebas, en el servidor:
python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
for ch in ['whatsapp', 'messenger', 'instagram']:
    cnt = c.execute('SELECT COUNT(*) FROM MetaConversation WHERE channel=?', (ch,)).fetchone()[0]
    print(f'{ch}: {cnt} conversaciones')
"
# → debe mostrar 1 conversación por canal
```

### 9.4 Verificar detección de canal en logs

En Vercel → Functions → ver logs de la ruta `/api/meta/webhook`:
- Cuando llega un mensaje de WhatsApp: log `channel=whatsapp customerPlatformId=521...`.
- Messenger: `channel=messenger customerPlatformId=<psid>`.
- Instagram: `channel=instagram customerPlatformId=<igsid>`.

---

## Paso 10 — Pasar a Live

1. App Review aprobado (paso 7).
2. En Meta App → Settings → "App Mode" → toggle a **Live**.
3. Verificar que los tokens de producción (no Sandbox) estén configurados en Vercel.
4. Hacer 1 prueba con un beta tester (cliente real del negocio) por cada canal.
5. Monitorear logs las primeras 24 horas.

---

## Checklist final

- [ ] Página de Facebook creada y configurada.
- [ ] Instagram Business conectado a la página.
- [ ] Meta Business Suite configurado con Page, IG y WA Business.
- [ ] Meta App con 3 productos agregados (WhatsApp, Messenger, Instagram).
- [ ] Webhook único `/api/meta/webhook` configurado en los 3 productos.
- [ ] Verify Token compartido `META_VERIFY_TOKEN`.
- [ ] App Secret compartido `META_APP_SECRET`.
- [ ] Page Access Token generado (`MESSENGER_PAGE_ACCESS_TOKEN`).
- [ ] Instagram Account ID anotado (`INSTAGRAM_ACCOUNT_ID`).
- [ ] 12 variables de entorno configuradas en Vercel.
- [ ] Páginas legales `/privacidad` y `/terminos` publicadas en el sitio.
- [ ] App Review enviado para `instagram_manage_messages` y `pages_messaging` (Advanced Access).
- [ ] App Review aprobado.
- [ ] App en modo Live.
- [ ] Pruebas con beta tester en 3 canales.

---

## Troubleshooting

### "Verify Token does not match" al configurar webhook
- Verificar que `META_VERIFY_TOKEN` en Vercel sea EXACTAMENTE el mismo que escribiste en Meta (sensible a mayúsculas, espacios).
- Redeploy tras cambiar variables en Vercel (`vercel --prod` o push a `main`).

### "Invalid signature" en logs
- Verificar `META_APP_SECRET` (es el App Secret, no el Access Token).
- Verificar que el handler use `crypto.timingSafeEqual` (no `===`) para evitar timing attacks.

### "Bot no responde en Messenger/IG pero sí en WhatsApp"
- Verificar que el payload tiene `object: "page"` (Messenger) o `object: "instagram"` (IG).
- Verificar que los adaptadores de canal están implementados en `src/lib/meta-bridge.ts`.
- Revisar logs del dispatcher.

### "Permission denied" o "Insufficient permission"
- Falta Advanced Access en un permiso. Verificar App Review (paso 7).
- En modo Sandbox, asegúrate de que el usuario es administrador de la página/IG.

### "Message not delivered within 24h window"
- El cliente escribió hace más de 24h. Para Messenger/IG, solo puedes enviar si usas un "Message Tag" (`HUMAN_AGENT`, `CONFIRMED_EVENT_UPDATE`, etc.).
- WhatsApp Cloud API no tiene esta limitación si usas plantillas pre-aprobadas.

### El bot responde lento (>10s)
- Vercel Hobby tiene timeout de 10s. Si el agente IA (Z.ai SDK) tarda más:
  - Subir a Vercel Pro ($20/mes) — DEC-LOGAN-013.
  - O implementar streaming responses (avanzado).

---

## Apéndice — URLs y recursos oficiales

- Meta for Developers: https://developers.facebook.com/
- Meta Business Suite: https://business.facebook.com/
- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Webhook reference (WhatsApp): https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
- Webhook reference (Messenger): https://developers.facebook.com/docs/messenger-platform/reference/webhook-events
- Webhook reference (Instagram): https://developers.facebook.com/docs/instagram-platform/webhooks
- App Review docs: https://developers.facebook.com/docs/app-review
- Rate limiting: https://developers.facebook.com/docs/graph-api/overview/rate-limiting
- Allowed IPs for Meta webhooks: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#step6

---

*Guía bajo metodología LOGAN v1.0.*
*Art. II: documentación precede al desarrollo — esta guía es requisito antes de tocar la configuración de Meta.*
*Art. III: simplicidad — una sola app, una sola URL, 3 productos suscritos a la misma.*
*Art. V: separación de responsabilidades — Meta define la infra, el producto define el bot.*
