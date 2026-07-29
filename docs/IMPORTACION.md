# Importación inicial

No se recibieron en este repositorio los archivos de la memoria USB ni el
listado oficial de las 68 JAC. Por tanto, los 68 registros productivos quedan
pendientes de validación institucional y no se inventaron datos.

## Plantilla CSV

Columnas reconocidas:

`codigo,nombre,vereda_barrio,vereda_barrio_original,zona,afiliados,nit,personeria,resolucion,direccion,telefono,correo`

Primero ejecute una previsualización:

```bash
bun run import:juntas -- ./datos/juntas.csv
```

Después de corregir duplicados, fechas y valores ambiguos:

```bash
bun run import:juntas -- ./datos/juntas.csv --confirm
```

La fuente original debe conservarse inalterada y con acceso restringido. Los
conflictos de código, NIT y personería deben ser resueltos por la Oficina de
Desarrollo Comunitario, no por una transformación automática.
