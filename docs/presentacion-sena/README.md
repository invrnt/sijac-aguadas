# Presentación SENA

Fuente del PDF `docs/SIJAC_Aguadas_Presentacion_SENA.pdf`.

- `presentacion.html`: contenido y diseño (editar aquí).
- `img/`: capturas de la app y foto de portada (`hero.jpg`).
- `scripts/shots.mjs`: toma capturas de la app en modo demo (en la raíz: `DEMO_MODE=true bun run dev -- -p 3457`). Guarda PNG; convertir a JPG con `magick`.

```bash
bun install
bun run pdf
```

Requiere Chromium en `/usr/bin/chromium`.
