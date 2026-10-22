# Operación de SIJAC Aguadas

## Respaldo

La persona responsable debe programar:

- exportación diaria de D1 (`wrangler d1 export sijac --remote --output respaldo.sql`);
  D1 conserva además 30 días de Time Travel para restauraciones puntuales;
- verificación semanal del estado de los respaldos;
- exportación mensual cifrada a una ubicación institucional separada;
- inventario mensual del bucket privado `sijac-private`.

Nunca publique respaldos ni use datos productivos en desarrollo sin anonimización.

## Restauración

1. Cree una base D1 y un bucket R2 aislados para la prueba.
2. Importe el respaldo con `wrangler d1 execute <base> --remote --file respaldo.sql`,
   o use `wrangler d1 time-travel restore` sobre la base afectada.
3. Restaure los objetos de R2 conservando sus rutas.
4. Configure los bindings y secretos del entorno de prueba.
5. Ejecute `wrangler d1 migrations apply <base> --remote`.
6. Compruebe inicio de sesión, una ficha, un documento, un acta y la auditoría.
7. Registre fecha, duración, responsable, resultado e incidencias.

## Incidentes

Ante indisponibilidad, proteja primero la integridad de los datos. No habilite
enlaces públicos de archivos como alternativa temporal. Documente el inicio,
impacto, medidas, recuperación y acciones preventivas.

## Límites de costo

Revise mensualmente almacenamiento, transferencia, conexiones y ejecución de
Workers, D1 y R2 en Cloudflare. Evalúe un plan pago antes de acercarse al 80 %
de cualquier cuota o cuando el servicio deba operar con garantías contractuales.
