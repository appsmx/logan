# Arquitectura Multi-canal LOGAN — Diagramas

> **Proyecto:** Mariscos Quiroa (piloto LOGAN)
> **Metodología:** LOGAN v1.0
> **Decisión asociada:** DEC-MULTI-001 (arquitectura webhook unificado)
> **Fecha:** 2026-08-31

Diagramas Mermaid para visualizar la arquitectura completa del Asistente IA multi-canal.

---

## 1. Diagrama de alto nivel (cliente → Meta → Producto)

```mermaid
flowchart LR
    subgraph Clientes["Clientes en canales sociales"]
        C1["👤 Cliente en WhatsApp<br/>+52 663 699 9689"]
        C2["👤 Cliente en Facebook Messenger<br/>(página Mariscos Quiroa)"]
        C3["👤 Cliente en Instagram DM<br/>(@mariscosquiroa)"]
    end

    subgraph Meta["Meta Business Suite"]
        WA["WhatsApp Cloud API<br/>wa_id: 521..."]
        MSG["Messenger Platform<br/>psid: <id>"]
        IG["Instagram Messaging API<br/>igsid: <id>"]
        WEBHOOK["Webhook unificado<br/>POST /api/meta/webhook<br/>Firma: X-Hub-Signature-256"]
    end

    subgraph Producto["Mariscos Quiroa (Next.js 16 en Vercel)"]
        HANDLER["Webhook Handler<br/>src/app/api/meta/webhook/route.ts"]
        BRIDGE["Meta Bridge<br/>src/lib/meta-bridge.ts<br/>3 adaptadores + dispatcher"]
        CHANNELS["Meta Channels<br/>src/lib/meta-channels.ts<br/>sendWhatsApp, sendMessenger, sendInstagram"]
        AGENT["Agente IA<br/>processCustomerMessage<br/>(Z.ai SDK GLM)"]
        DB[("Prisma + SQLite/Neon<br/>MetaConversation<br/>MetaMessage")]
    end

    C1 -->|mensaje texto| WA
    C2 -->|mensaje texto| MSG
    C3 -->|mensaje texto| IG

    WA --> WEBHOOK
    MSG --> WEBHOOK
    IG --> WEBHOOK

    WEBHOOK -->|verify signature| HANDLER
    HANDLER -->|normalized msg| BRIDGE
    BRIDGE -->|load history| DB
    BRIDGE -->|prompt + history| AGENT
    AGENT -->|response text| BRIDGE
    BRIDGE -->|persist| DB
    BRIDGE -->|send response| CHANNELS
    CHANNELS -->|POST graph.facebook.com| WA
    CHANNELS -->|POST graph.facebook.com| MSG
    CHANNELS -->|POST graph.facebook.com| IG

    WA -.->|entrega| C1
    MSG -.->|entrega| C2
    IG -.->|entrega| C3
```

---

## 2. Flujo detallado del webhook handler

```mermaid
sequenceDiagram
    participant Meta
    participant Webhook as /api/meta/webhook
    participant Bridge as meta-bridge.ts
    participant Agent as Agente IA
    participant DB as Prisma
    participant Channels as meta-channels.ts

    Meta->>Webhook: GET /api/meta/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=xyz
    Webhook-->>Meta: 200 OK "xyz" (verificación inicial)

    Note over Meta: Cliente escribe por cualquiera de los 3 canales

    Meta->>Webhook: POST /api/meta/webhook
    Note right of Webhook: Headers: X-Hub-Signature-256: sha256=HMAC<br/>Body: payload según canal (object=whatsapp_business_account|page|instagram)

    Webhook->>Webhook: 1. Verificar firma HMAC-SHA256<br/>(timingSafeEqual)
    Webhook->>Webhook: 2. ACK 200 OK inmediato a Meta
    Webhook->>Bridge: 3. Dispatch en background (Promise.allSettled)

    Note over Bridge: 4. Detectar canal por payload.object
    alt object="whatsapp_business_account"
        Bridge->>Bridge: normalizeWhatsApp(payload)
    else object="page"
        Bridge->>Bridge: normalizeMessenger(payload)
    else object="instagram"
        Bridge->>Bridge: normalizeInstagram(payload)
    end

    Bridge->>DB: 5. Idempotencia check<br/>(platformMessageId en MetaMessage?)
    DB-->>Bridge: not exists → continúa

    Bridge->>DB: 6. Upsert MetaConversation<br/>(channel, customerPlatformId)
    DB-->>Bridge: conversationId

    Bridge->>DB: 7. Load history (últimos 20 mensajes)
    DB-->>Bridge: messages[]

    Bridge->>Agent: 8. processCustomerMessage<br/>{text, history, locale, channel, attachments}
    Agent-->>Bridge: response text

    Bridge->>DB: 9. Persist inbound + outbound messages<br/>(source: AI/HUMAN/SYSTEM)

    Bridge->>Channels: 10. sendByChannel(channel, customerPlatformId, response)

    alt channel="whatsapp"
        Channels->>Meta: POST graph.facebook.com/v21.0/{phone_number_id}/messages
    else channel="messenger"
        Channels->>Meta: POST graph.facebook.com/v21.0/{page_id}/messages
    else channel="instagram"
        Channels->>Meta: POST graph.facebook.com/v21.0/{ig_account_id}/messages
    end

    Meta-->>Channels: 200 OK { message_id: "..." }

    Note over Meta: Mensaje entregado al cliente
```

---

## 3. Modelo de datos (Prisma schema multi-canal)

```mermaid
erDiagram
    MetaConversation ||--o{ MetaMessage : "1 a N"

    MetaConversation {
        string id PK
        enum channel "whatsapp | messenger | instagram"
        string customerPlatformId "wa_id, psid o igsid"
        string customerName "opcional"
        string customerPhone "opcional"
        string customerLocale "es | en"
        enum status "ACTIVE | ESCALATED_HUMAN | CLOSED | BLOCKED"
        enum lastChannelUsed "whatsapp | messenger | instagram"
        datetime lastInboundAt
        datetime lastOutboundAt
        datetime createdAt
        datetime updatedAt
    }

    MetaMessage {
        string id PK
        string conversationId FK
        enum direction "INBOUND | OUTBOUND"
        enum source "AI | HUMAN | SYSTEM"
        enum channel "whatsapp | messenger | instagram"
        string platformMessageId "wamid, mid (MSG), mid (IG)"
        enum status "sent | delivered | read | failed"
        string body "texto del mensaje"
        json attachments "array de {type, url, payload}"
        datetime createdAt
    }

    MetaConversation {
        string idx_unique_channel_customer "UNIQUE (channel, customerPlatformId)"
    }
    MetaMessage {
        string idx_unique_platformMessageId "UNIQUE (platformMessageId)"
        string idx_conv_created "INDEX (conversationId, createdAt)"
    }
```

---

## 4. Estructura de archivos en el repositorio

```mermaid
graph TD
    subgraph LOGAN["appsmx/logan (metodología + templates)"]
        SPEC["templates/asistente-ia/SPECIFICATION.md<br/>v2.0 multi-canal"]
        WH_TEMPLATE["templates/asistente-ia/webhook-handler-template.ts<br/>v2.0 con detección de canal"]
        IG_TEMPLATE["templates/asistente-ia/integration-guide.md<br/>v2.0 con setup Meta"]
        SP_TEMPLATE["templates/asistente-ia/system-prompt-template.md<br/>v2.0 con conciencia de canal"]
    end

    subgraph MQ["appsmx/mariscosquiroa (producto)"]
        ROUTE["src/app/api/meta/webhook/route.ts<br/>handler multi-canal (GET + POST)"]
        ROUTE_LEGACY["src/app/api/whatsapp/webhook/route.ts<br/>alias/legacy para compatibilidad"]
        BRIDGE["src/lib/meta-bridge.ts<br/>3 adaptadores + dispatcher"]
        CHANNELS["src/lib/meta-channels.ts<br/>sendWhatsApp, sendMessenger, sendInstagram"]
        AGENT["src/lib/agent.ts<br/>processCustomerMessage (sin cambios)"]
        PRISMA["prisma/schema.prisma<br/>MetaConversation + MetaMessage (migrado de Whatsapp*)"]
        ENV_EXAMPLE[".env.example<br/>12 vars (3 compartidas + 9 específicas)"]
    end

    subgraph Vercel["Vercel (deploy)"]
        ENV_PROD["Environment Variables<br/>META_APP_SECRET, META_VERIFY_TOKEN,<br/>WHATSAPP_*, MESSENGER_*, INSTAGRAM_*"]
    end

    subgraph MetaBusiness["Meta Business Suite"]
        APP["Meta App<br/>(WhatsApp + Messenger + Instagram)"]
        WEBHOOK_CFG["Webhook config<br/>URL: /api/meta/webhook<br/>Verify Token, App Secret"]
    end

    SPEC -.->|referenciado por| ROUTE
    WH_TEMPLATE -.->|copiado y adaptado por| ROUTE
    IG_TEMPLATE -.->|usado por| APP

    ROUTE --> BRIDGE
    BRIDGE --> CHANNELS
    BRIDGE --> AGENT
    BRIDGE --> PRISMA
    ROUTE --> ENV_EXAMPLE
    ENV_EXAMPLE -.->|configurado en| ENV_PROD

    APP --> WEBHOOK_CFG
    WEBHOOK_CFG -->|3 productos suscritos| ROUTE
    ENV_PROD --> ROUTE
```

---

## 5. Decisiones LOGAN (DEC-MULTI-001 a 003)

```mermaid
mindmap
  root((Multi-canal LOGAN))
    DEC-MULTI-001
      Arquitectura webhook unificado
      Una URL para 3 canales
      Reduce complejidad Art. III
      Detección por payload.object
    DEC-MULTI-002
      Agente IA sin cambios
      processCustomerMessage existente
      Sesión compartida por canal
      Rate-limit por customerPlatformId
    DEC-MULTI-003
      Renombrado de tablas
      WhatsappConversation → MetaConversation
      WhatsappMessage → MetaMessage
      Campo channel enum
      Migración con backward-compat
    Art III Simplicidad
      1 handler no 3
      1 firma no 3
      1 dispatcher con adaptadores
    Art IV Fuente de verdad
      SPEC en logan repo
      Implementación en mariscosquiroa
      Documentación precede Art. II
    Art V Separación
      LOGAN define contrato
      Producto ejecuta
      Meta provee infra
```

---

## 6. Fases del proyecto (línea de tiempo)

```mermaid
gantt
    title Multi-canal Mariscos Quiroa — Fases
    dateFormat  YYYY-MM-DD
    axisFormat  %d-%b

    section Fase 1 - Documentación
    Plan MULTILOGAN              :done, f1a, 2026-08-31, 1d
    SPEC v2.0 multi-canal        :done, f1b, 2026-08-31, 1d
    Guía setup Meta              :done, f1c, 2026-08-31, 1d
    Diagrama arquitectura        :done, f1d, 2026-08-31, 1d
    Actualizar templates en logan :f1e, 2026-08-31, 1d

    section Fase 2 - Implementación
    Migración Prisma multi-canal :f2a, 2026-09-01, 1d
    meta-channels.ts 3 funciones :f2b, 2026-09-01, 1d
    meta-bridge.ts adaptadores   :f2c, 2026-09-02, 1d
    webhook route multi-canal    :f2d, 2026-09-02, 1d
    Tests firma/idempotencia     :f2e, 2026-09-03, 1d
    Commit + push a main        :f2f, 2026-09-03, 1d

    section Fase 3 - Setup Meta
    Crear página FB + IG Business :f3a, 2026-09-04, 1d
    Configurar Meta App + productos :f3b, 2026-09-04, 1d
    Webhook config 3 canales     :f3c, 2026-09-04, 1d
    App Review (paralelo)       :f3d, 2026-09-04, 10d
    Variables Vercel            :f3e, 2026-09-04, 1d

    section Fase 4 - Hardening
    Dashboard multi-canal admin  :f4a, 2026-09-15, 3d
    Soporte attachments         :f4b, 2026-09-18, 5d
    Vinculación cruzada identidades :f4c, 2026-09-25, 5d
```

---

## 7. Flujo de estados de una conversación

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Primer mensaje del cliente<br/>(cualquier canal)

    ACTIVE --> ACTIVE: Bot responde IA<br/>(<20 msgs, <30min inactividad)
    ACTIVE --> ESCALATED_HUMAN: Cliente pide humano<br/>o bot no puede responder
    ACTIVE --> CLOSED: 30 min inactividad<br/>o mensaje de cierre del sistema

    ESCALATED_HUMAN --> ACTIVE: Humano resuelve<br/>y marca conversación como activa
    ESCALATED_HUMAN --> CLOSED: Humano cierra conversación
    ESCALATED_HUMAN --> BLOCKED: Cliente spam o abuso

    CLOSED --> ACTIVE: Cliente vuelve a escribir<br/>(nueva sesión, mismo conversationId)
    CLOSED --> [*]

    BLOCKED --> [*]: Reset manual admin

    note right of ACTIVE
        Rate-limit:
        - 20 msgs/sesión
        - 30 min expiración
        - 2000 chars entrante
        - 200 palabras respuesta
    end note

    note right of ESCALATED_HUMAN
        Bot ofrece:
        - WhatsApp +52 663 699 9689
        - Email del producto
        - Instagram @mariscosquiroa
        - Facebook /mariscosquiroa
        Respuesta humana <PRODUCT_RESPONSE_TIME>
    end note
```

---

## 8. Comparación: antes (solo WhatsApp) vs ahora (multi-canal)

```mermaid
graph TB
    subgraph Antes["ANTES — Solo WhatsApp (v1.0)"]
        A1["Cliente WA"]
        A2["Meta WhatsApp Cloud API"]
        A3["Webhook /api/whatsapp/webhook"]
        A4["whatsapp-bridge.ts"]
        A5["whatsapp.ts (1 función send)"]
        A6["Agente IA"]
        A7["WhatsappConversation + WhatsappMessage"]
        A8["6 vars env"]

        A1 --> A2 --> A3 --> A4 --> A6
        A6 --> A5 --> A2
        A4 --> A7
    end

    subgraph Ahora["AHORA — Multi-canal (v2.0)"]
        B1["Clientes en WA + MSG + IG"]
        B2["Meta App (3 productos)"]
        B3["Webhook /api/meta/webhook (único)"]
        B4["meta-bridge.ts (3 adaptadores)"]
        B5["meta-channels.ts (3 funciones send)"]
        B6["Agente IA (sin cambios)"]
        B7["MetaConversation + MetaMessage (con channel)"]
        B8["12 vars env (3 compartidas + 9 específicas)"]

        B1 --> B2 --> B3 --> B4 --> B6
        B6 --> B5 --> B2
        B4 --> B7
    end

    style Antes fill:#fef3c7,stroke:#92400e
    style Ahora fill:#dcfce7,stroke:#166534
```

---

## 9. Mapa de endpoints y archivos

```mermaid
flowchart TD
    subgraph Public["Endpoints públicos (Vercel)"]
        GET_WEBHOOK["GET /api/meta/webhook<br/>verificación Meta"]
        POST_WEBHOOK["POST /api/meta/webhook<br/>recepción mensajes"]
        LEGACY["/api/whatsapp/webhook (alias legacy)"]
        ADMIN_SEND["POST /api/admin/send-message<br/>envío manual admin"]
        ADMIN_TEST["GET /api/admin/test-channels<br/>diagnóstico multi-canal"]
    end

    subgraph Libs["Bibliotecas internas (src/lib)"]
        META_CHANNELS["meta-channels.ts"]
        META_BRIDGE["meta-bridge.ts"]
        META_VERIFY["meta-verify.ts<br/>(firma HMAC + idempotencia)"]
        WHATSAPP_LEGACY["whatsapp.ts<br/>(redirige a meta-channels)"]
        AGENT_LIB["agent.ts<br/>(processCustomerMessage)"]
    end

    subgraph Prisma["Prisma Schema"]
        META_CONV["MetaConversation"]
        META_MSG["MetaMessage"]
        PRODUCT["Product"]
        CUSTOMER["Customer"]
    end

    GET_WEBHOOK --> META_VERIFY
    POST_WEBHOOK --> META_VERIFY
    POST_WEBHOOK --> META_BRIDGE
    LEGACY --> POST_WEBHOOK
    ADMIN_SEND --> META_CHANNELS
    ADMIN_TEST --> META_CHANNELS

    META_BRIDGE --> AGENT_LIB
    META_BRIDGE --> META_CONV
    META_BRIDGE --> META_MSG
    META_CHANNELS --> META_MSG
```

---

## 10. Decisiones LOGAN asociadas

| ID | Decisión | Status |
|---|---|---|
| DEC-LOGAN-004 | El Asistente IA NO registra hipótesis | ✅ Se mantiene |
| DEC-LOGAN-011 | Módulos viven en `templates/` | ✅ Se actualiza SPEC v2.0 |
| DEC-LOGAN-013 | Vercel Pro si timeout 10s no basta | ⏳ Se reevaluará en Fase 2 |
| DEC-LOGAN-016 | logancorp.mx como dominio corporativo | N/A (es de LOGAN OS, no de MQ) |
| DEC-LOGAN-017 | Mix de modelos GLM según criticidad | ✅ Agente IA usa GLM-5-turbo (tier barato) |
| **DEC-MULTI-001** | **Arquitectura webhook unificado multi-canal** | ✅ Nueva |
| **DEC-MULTI-002** | **Agente IA sin cambios en multi-canal** | ✅ Nueva |
| **DEC-MULTI-003** | **Renombrado de tablas + campo channel** | ✅ Nueva |

---

*Diagramas bajo metodología LOGAN v1.0.*
*Art. III (simplicidad) — una sola URL, un solo handler, un solo dispatcher.*
*Art. IV (una sola fuente de verdad) — los diagramas viven en el repo del producto, el SPEC en `appsmx/logan`.*
