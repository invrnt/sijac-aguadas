# SIJAC Aguadas

## Catálogo de funcionalidades y casos de uso

**Sistema de Información de Juntas de Acción Comunal de Aguadas**  
Versión funcional: julio de 2026

## 1. Propósito

Este documento describe, desde la perspectiva de sus usuarios, las funcionalidades disponibles en SIJAC Aguadas. Cada caso de uso identifica quién puede realizar la acción, qué condiciones deben cumplirse, el flujo esperado y el resultado obtenido.

## 2. Actores y alcance

| Actor | Alcance |
|---|---|
| Visitante | Consulta la presentación y política de privacidad, inicia sesión y solicita recuperación de acceso. |
| Usuario Consulta | Accede a información institucional, fichas de JAC, reuniones, actas, compromisos, actividades y reportes; puede imprimir o exportar cuando la pantalla lo permite. |
| Administrador | Incluye todas las capacidades de Consulta y además crea, actualiza, archiva y administra información, documentos, usuarios y configuración. |
| Servicios externos | Cloudflare D1 conserva los datos y R2 los archivos privados; Resend entrega invitaciones y recuperaciones; Cloudflare Workers aloja la aplicación. |

## 3. Reglas generales

- Las funciones internas requieren una sesión válida.
- Los permisos se verifican tanto en la interfaz como en las API.
- Los archivos institucionales son privados y se descargan mediante enlaces temporales.
- Los cambios sensibles generan registros de auditoría.
- Las actas, reuniones, compromisos y actividades respetan transiciones de estado permitidas.
- El último administrador activo no puede ser suspendido.
- La aplicación es responsive, mobile first e instalable como PWA.

## 4. Casos de uso

### CU-01. Iniciar sesión

**Actor:** Usuario Consulta o Administrador.  
**Objetivo:** Acceder al sistema mediante correo electrónico o nombre de usuario.  
**Precondiciones:** La cuenta existe, está activa y dispone de contraseña.  
**Flujo principal:**

1. El usuario abre la pantalla de inicio de sesión.
2. Ingresa correo o nombre de usuario y contraseña.
3. El sistema valida las credenciales y aplica límites contra intentos repetidos.
4. El sistema crea una sesión segura y dirige al panel.

**Resultado:** El usuario accede únicamente a las funciones autorizadas para su rol.  
**Alternativas:** Si la cuenta está suspendida o las credenciales son incorrectas, el acceso se rechaza sin revelar información sensible.

### CU-02. Recuperar el acceso

**Actor:** Usuario registrado.  
**Objetivo:** Crear una nueva contraseña mediante un enlace seguro.  
**Precondiciones:** El correo pertenece a una cuenta registrada y Resend está configurado.  
**Flujo principal:**

1. El usuario solicita recuperación e ingresa su correo.
2. El sistema genera un token temporal de un solo uso.
3. React Email genera un correo responsive en HTML y texto plano.
4. Resend entrega el mensaje con el enlace.
5. El usuario define una nueva contraseña.

**Resultado:** La contraseña se actualiza y el enlace queda invalidado.  
**Alternativas:** La respuesta pública es neutra aunque el correo no exista, para evitar enumeración de cuentas.

### CU-03. Consultar el panel general

**Actor:** Consulta o Administrador.  
**Objetivo:** Obtener una visión resumida de la gestión comunal.  
**Precondiciones:** Sesión válida.  
**Flujo principal:**

1. El usuario abre el panel.
2. El sistema calcula indicadores desde la base de datos.
3. Presenta conteos, distribución de estados y actividad reciente.
4. El usuario navega al módulo relacionado.

**Resultado:** El usuario identifica rápidamente la situación general y los registros que requieren atención.

### CU-04. Buscar y filtrar JAC

**Actor:** Consulta o Administrador.  
**Objetivo:** Localizar juntas por nombre, código, barrio, vereda, zona o estado.  
**Precondiciones:** Sesión válida.  
**Flujo principal:**

1. El usuario abre el directorio de juntas.
2. Escribe un término o selecciona filtros.
3. El sistema actualiza el listado.
4. El usuario abre la ficha seleccionada.

**Resultado:** Se muestra únicamente la información coincidente. El usuario también puede imprimir o exportar el resultado filtrado a CSV.

### CU-05. Consultar la ficha integral de una JAC

**Actor:** Consulta o Administrador.  
**Objetivo:** Revisar la información institucional y operativa de una junta.  
**Precondiciones:** La JAC existe y no está oculta para el usuario.  
**Flujo principal:**

1. El usuario abre la ficha.
2. Consulta identificación, ubicación, estado, afiliados y reconocimiento.
3. Revisa dignatarios, convenios y documentos asociados.
4. Accede a los registros operativos relacionados.

**Resultado:** El usuario obtiene una vista consolidada de la JAC.

### CU-06. Crear o editar una JAC

**Actor:** Administrador.  
**Objetivo:** Registrar o actualizar la ficha institucional de una junta.  
**Precondiciones:** Sesión administrativa.  
**Flujo principal:**

1. El administrador abre el formulario de creación o edición.
2. Completa identificación, ubicación, zona, afiliados, estado y datos jurídicos.
3. El sistema valida campos y posibles duplicados.
4. El administrador guarda.
5. El sistema registra el cambio y su auditoría.

**Resultado:** La ficha queda disponible inmediatamente en directorios y reportes.  
**Alternativas:** Los datos inválidos se rechazan con mensajes comprensibles.

### CU-07. Archivar una JAC

**Actor:** Administrador.  
**Objetivo:** Retirar una junta de los listados activos sin eliminar su historia.  
**Precondiciones:** La JAC existe y el administrador confirma la operación.  
**Flujo principal:**

1. El administrador abre la ficha.
2. Selecciona archivar.
3. El sistema conserva el estado anterior y marca la fecha.
4. Registra la operación en auditoría.

**Resultado:** La JAC deja de aparecer por defecto, pero conserva sus relaciones y trazabilidad.

### CU-08. Gestionar dignatarios

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Mantener la relación de personas y cargos de una JAC.  
**Precondiciones:** La JAC existe.  
**Flujo principal:**

1. El usuario consulta la sección de dignatarios.
2. El administrador abre el formulario.
3. Registra nombre, cargo, periodo y vigencia.
4. El sistema asocia el dignatario con la JAC.

**Resultado:** La composición directiva queda visible en la ficha.

### CU-09. Gestionar convenios

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Registrar compromisos interinstitucionales asociados a una JAC.  
**Precondiciones:** La JAC existe.  
**Flujo principal:**

1. El usuario consulta los convenios existentes.
2. El administrador registra nombre, entidad, fechas, valor y estado.
3. El sistema valida y guarda la información.

**Resultado:** El convenio se incorpora al historial institucional.

### CU-10. Cargar y descargar documentos privados

**Actor:** Administrador para cargar; usuarios autorizados para descargar.  
**Objetivo:** Conservar soportes institucionales de forma privada.  
**Precondiciones:** La JAC existe y el almacenamiento R2 está disponible.  
**Flujo principal:**

1. El administrador selecciona un archivo permitido.
2. El sistema valida formato, nombre y límite de 10 MB.
3. El archivo se almacena en un bucket privado y se registra su metadato.
4. Un usuario autorizado solicita la descarga.
5. El sistema verifica la sesión y entrega el archivo directamente.

**Resultado:** El documento se conserva sin exposición pública directa.

### CU-11. Registrar y consultar reuniones

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Planear y documentar reuniones de las JAC.  
**Precondiciones:** Existe una JAC activa.  
**Flujo principal:**

1. El administrador registra JAC, título, tipo, fecha, hora y lugar.
2. El sistema crea la reunión en borrador.
3. El usuario puede buscarla por título, junta, lugar o estado.
4. El administrador avanza el estado conforme al flujo permitido.

**Resultado:** La reunión queda disponible para agenda, asistencia y posterior acta.

### CU-12. Gestionar agenda y asistencia

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Preparar los temas y registrar participantes de una reunión.  
**Precondiciones:** La reunión existe.  
**Flujo principal:**

1. El administrador abre el detalle de la reunión.
2. Añade puntos de agenda en orden.
3. Registra cada asistente.
4. Marca asistencia, inasistencia o excusa.

**Resultado:** La reunión conserva agenda y control de participación.

### CU-13. Crear y redactar un acta

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Documentar formalmente una reunión finalizada.  
**Precondiciones:** Existe una reunión finalizada.  
**Flujo principal:**

1. El administrador selecciona la reunión.
2. Registra número, año y resumen inicial.
3. Añade secciones narrativas y decisiones.
4. Revisa el contenido y cambia su estado según el flujo permitido.

**Resultado:** El acta queda vinculada a la reunión y a la JAC.

### CU-14. Generar un acta en PDF

**Actor:** Consulta o Administrador.  
**Objetivo:** Obtener una versión imprimible del acta.  
**Precondiciones:** El acta existe y el usuario tiene sesión.  
**Flujo principal:**

1. El usuario abre el acta.
2. Selecciona generar PDF.
3. El servidor compone el documento con los datos, secciones y decisiones.
4. El navegador descarga o muestra el archivo.

**Resultado:** Se obtiene una copia PDF lista para archivo o impresión.

### CU-15. Gestionar compromisos

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Registrar tareas derivadas de la gestión comunal y hacer seguimiento.  
**Precondiciones:** Existe una JAC relacionada.  
**Flujo principal:**

1. El administrador registra título, responsable y fecha límite.
2. El sistema crea el compromiso como pendiente.
3. El usuario consulta y filtra los compromisos.
4. El administrador actualiza su estado respetando las transiciones permitidas.

**Resultado:** El compromiso conserva responsable, vencimiento, progreso y trazabilidad.

### CU-16. Gestionar actividades

**Actor:** Administrador; Consulta en modo lectura.  
**Objetivo:** Planear y hacer seguimiento a actividades comunitarias.  
**Precondiciones:** Existe una JAC relacionada.  
**Flujo principal:**

1. El administrador registra título, responsable, fecha, lugar y beneficiarios estimados.
2. El sistema crea la actividad como planeada.
3. El usuario consulta y filtra el listado.
4. El administrador actualiza el estado durante su ejecución.

**Resultado:** La actividad se integra a los indicadores y reportes.

### CU-17. Consultar, imprimir y exportar reportes

**Actor:** Consulta o Administrador.  
**Objetivo:** Analizar información consolidada para seguimiento o rendición de cuentas.  
**Precondiciones:** Sesión válida y datos disponibles.  
**Flujo principal:**

1. El usuario abre Reportes.
2. Selecciona el conjunto de datos disponible.
3. Revisa indicadores y registros consolidados.
4. Imprime la vista o descarga un archivo CSV.

**Resultado:** El usuario obtiene información reutilizable para análisis externo.

### CU-18. Administrar usuarios e invitaciones

**Actor:** Administrador.  
**Objetivo:** Crear cuentas, asignar roles y controlar el acceso.  
**Precondiciones:** Sesión administrativa y correo configurado.  
**Flujo principal:**

1. El administrador registra nombre, correo, usuario y rol.
2. El sistema crea la cuenta con una contraseña temporal no revelada.
3. React Email genera una invitación mobile first.
4. Resend entrega el enlace para establecer contraseña.
5. El administrador puede suspender o reactivar la cuenta.

**Resultado:** La persona dispone de acceso conforme al rol asignado.  
**Alternativas:** El sistema impide suspender al último administrador activo.

### CU-19. Consultar auditoría

**Actor:** Administrador.  
**Objetivo:** Revisar acciones sensibles realizadas en el sistema.  
**Precondiciones:** Sesión administrativa.  
**Flujo principal:**

1. El administrador abre Auditoría.
2. El sistema muestra actor, acción, entidad, fecha y contexto.
3. El administrador revisa valores anteriores y nuevos cuando corresponda.

**Resultado:** Existe trazabilidad para control interno e investigación de incidentes.

### CU-20. Administrar configuración institucional

**Actor:** Administrador.  
**Objetivo:** Ajustar parámetros generales visibles o aplicables en la operación.  
**Precondiciones:** Sesión administrativa.  
**Flujo principal:**

1. El administrador abre Configuración.
2. Modifica los parámetros disponibles.
3. El sistema valida y guarda los cambios.
4. Registra la modificación en auditoría.

**Resultado:** La aplicación refleja la configuración institucional actualizada.

## 5. Funciones transversales

### Seguridad y privacidad

- Sesiones seguras con vencimiento y cookies protegidas en producción.
- Control de acceso por rol y permiso en servidor.
- Limitación de intentos de autenticación y recuperación.
- Validación de entradas con mensajes seguros.
- Almacenamiento privado y enlaces temporales.
- Auditoría de operaciones sensibles.

### Experiencia de usuario

- Interfaz mobile first para teléfono, tableta y escritorio.
- Navegación lateral en escritorio y navegación inferior en móvil.
- Estados de carga, vacíos, confirmaciones y errores.
- Impresión optimizada y exportaciones CSV.
- PWA instalable con página de contingencia sin conexión.
- Correos responsive compatibles con clientes móviles y versión de texto plano.

## 6. Matriz resumida de permisos

| Funcionalidad | Visitante | Consulta | Administrador |
|---|:---:|:---:|:---:|
| Presentación, privacidad e inicio de sesión | Sí | Sí | Sí |
| Consultar módulos y fichas | No | Sí | Sí |
| Imprimir y exportar | No | Sí | Sí |
| Crear o modificar información | No | No | Sí |
| Cargar documentos | No | No | Sí |
| Descargar documentos autorizados | No | Sí | Sí |
| Administrar usuarios y configuración | No | No | Sí |
| Consultar auditoría | No | No | Sí |

## 7. Límites y consideraciones operativas

- Los datos iniciales de 68 JAC son ficticios y deben sustituirse mediante el importador antes del uso institucional.
- El envío real de correos depende de un dominio remitente verificado en Resend.
- La base de datos D1 y el bucket R2 se enlazan al Worker en `wrangler.jsonc`; las migraciones se aplican con wrangler antes de cada despliegue.
- Las variables secretas nunca deben publicarse ni usar el prefijo `NEXT_PUBLIC_`.
- El modo demostración debe permanecer desactivado en producción.
