# Seguridad y privacidad

- Better Auth administra contraseñas, sesiones, recuperación y bloqueo.
- Los permisos se verifican en servidor mediante una matriz centralizada.
- El rol Consulta no puede mutar recursos.
- Los documentos se almacenan en un bucket privado y se descargan con enlaces
  firmados de 60 segundos.
- Las mutaciones institucionales escriben auditoría con valores anteriores y
  nuevos; contraseñas, tokens y documentos completos quedan excluidos.
- La política predeterminada enmascara documentos de identidad para Consulta.
- Vercel fuerza HTTPS en producción y la aplicación añade encabezados de
  endurecimiento.

Antes de usar datos reales, la Alcaldía debe aprobar la política exacta de
visibilidad de documentos de identidad y completar los datos del responsable
de tratamiento.
