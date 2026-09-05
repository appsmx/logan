# LOGAN — Showcase web

Experiencia web inmersiva de una sola página para presentar el ecosistema LOGAN OS
(los 9 agentes, el bucle de hipótesis y los productos en vivo).

- **Archivo:** [`index.html`](./index.html) — autónomo, sin dependencias externas ni build.
- **Stack:** HTML + CSS + JS vanilla. Escena 3D neural en `<canvas>` puro, scroll cinemático,
  cursor personalizado, terminal animada que demuestra la orquestación multi-agente, y
  audio cinematográfico opcional generado en vivo con la Web Audio API (botón "Sonido").

## Productos enlazados (en vivo)

| # | Producto | Enlace |
|---|----------|--------|
| 01 | Mr. Trámite | https://mrtramite.mx |
| 02 | Mariscos Quiroa | https://mariscosquiroa.com |
| 03 | Restaurant POS | https://restaurant-pos.vercel.app |
| 04 | Hércules Bro | https://hercules-bro.vercel.app |
| 05 | Productores Musicales | Próximamente → https://www.loganos.com |

## Cómo verlo

Abre `index.html` en cualquier navegador (doble clic). No requiere servidor ni internet
(salvo para seguir los enlaces a los productos). Haz clic en **Sonido** para activar el
ambiente cinematográfico (los navegadores bloquean el audio hasta la primera interacción).

## Deploy

Al ser un archivo estático, se publica tal cual en Vercel/Netlify/Cloudflare Pages o como
sección del sitio corporativo `www.loganos.com`. No hay paso de build.

> Nota: las métricas y elementos visuales son demostrativos, para comunicar el potencial
> del ecosistema LOGAN. Los resultados reales varían según cada negocio.
