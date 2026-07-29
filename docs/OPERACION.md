# Operación de SIJAC Aguadas

## Respaldo

La persona responsable debe programar:

- respaldo diario de PostgreSQL mediante Supabase;
- verificación semanal del estado de los respaldos;
- exportación mensual cifrada a una ubicación institucional separada;
- inventario mensual del bucket privado `sijac-private`.

Nunca publique respaldos ni use datos productivos en desarrollo sin anonimización.

## Restauración

1. Cree un proyecto Supabase aislado para la prueba.
2. Restaure el respaldo de PostgreSQL según el procedimiento del proveedor.
3. Restaure los objetos conservando sus rutas.
4. Configure las variables del entorno de prueba.
5. ejecute `bun run db:migrate`.
6. Compruebe inicio de sesión, una ficha, un documento, un acta y la auditoría.
7. Registre fecha, duración, responsable, resultado e incidencias.

## Incidentes

Ante indisponibilidad, proteja primero la integridad de los datos. No habilite
enlaces públicos de archivos como alternativa temporal. Documente el inicio,
impacto, medidas, recuperación y acciones preventivas.

## Límites de costo

Revise mensualmente almacenamiento, transferencia, conexiones y ejecución de
funciones en Supabase y Vercel. Evalúe un plan pago antes de acercarse al 80 %
de cualquier cuota o cuando el servicio deba operar con garantías contractuales.
