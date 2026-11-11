# SIJAC Aguadas

Sistema web responsive y PWA para administrar las 68 Juntas de Acción Comunal
de Aguadas, Caldas. Incluye fichas institucionales, dignatarios, convenios,
documentos privados, reuniones, actas, compromisos, actividades, reportes,
usuarios, roles y auditoría.

## Instalación con un clic

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/invrnt/sijac-aguadas)

Pensado para quien no es técnico. No hay que instalar nada en el equipo:

1. Pulse el botón e inicie sesión en Cloudflare (o cree una cuenta gratuita)
   y conecte su cuenta de GitHub.
2. Cloudflare crea solo la base de datos D1, el bucket privado R2, una copia
   del repositorio en su GitHub y la compilación automática.
3. Complete el único secreto que pide el formulario: `SETUP_CODE`, una clave
   de instalación que usted inventa (mínimo 8 caracteres).
4. Deje el nombre del proyecto como `sijac-aguadas` y pulse **Create and
   deploy**. Las tablas de la base de datos se crean solas en la primera
   visita.
5. Abra la dirección `https://sijac-aguadas.<su-subdominio>.workers.dev`. La
   aplicación lo lleva al asistente `/configuracion-inicial`, que revisa la
   instalación, le indica en el panel de Cloudflare cómo corregir lo que falte
   y crea las dos cuentas de administrador con la clave de instalación. Se
   exigen dos para que la entidad no se quede sin acceso si una persona
   olvida su contraseña o deja el cargo.

Para que lleguen los correos (invitaciones y recuperación de contraseñas):

1. Active el plan **Workers Paid** (USD 5 al mes) en la misma cuenta.
2. Compre el dominio `sijac.org` en Cloudflare Registrar.
3. En **Email Service → Email Sending**, pulse **Onboard Domain**, elija
   `sijac.org` y pulse **Add records and onboard**. Cloudflare crea solo los
   registros SPF y DKIM.

No hay claves que copiar: el Worker envía con el binding `EMAIL`. Al crear los
administradores, el asistente les manda un correo de prueba y, si falla, explica la
causa. El remitente es `EMAIL_FROM` en `vars` de `wrangler.jsonc`
(`SIJAC Aguadas <no-responder@sijac.org>`); cámbielo si usa otro dominio.

Cada cambio que se suba a la copia del repositorio se vuelve a desplegar solo.
La clave de sesiones (`BETTER_AUTH_SECRET`) es opcional: si no se registra,
la aplicación genera una y la guarda en D1.

## Stack

- Next.js 16, React 19 y TypeScript
- Better Auth para cuentas, sesiones, recuperación, bloqueo y roles
- Cloudflare D1 (SQLite) con Drizzle ORM
- Cloudflare R2 privado para documentos
- React Email y Cloudflare Email Sending para correos transaccionales
- Bun como gestor de paquetes y ejecutor de scripts
- Cloudflare Workers como destino de despliegue mediante OpenNext

## Inicio local

Requisitos: Bun 1.3 o superior y Node.js 22.13 o superior (wrangler y OpenNext
se ejecutan sobre Node).

```bash
bun install
copy .env.local.example .env.local
bun run db:generate
bun run db:migrate:local
bun run db:seed
bun run dev
```

`next dev` usa una base D1 y un bucket R2 locales guardados en `.wrangler/`.
Con `DEMO_MODE=true` la aplicación ofrece acceso local como Administrador o
Consulta y usa exclusivamente datos ficticios, sin tocar D1.

`bun run db:generate` crea la migración SQL en `drizzle/` a partir de
`db/schema.ts` y la empaqueta en `db/migrations/bundled.ts`. Ejecútelo cada
vez que cambie el esquema y versione ambos resultados.

El Worker aplica las migraciones pendientes al recibir la primera solicitud
de cada instancia (`lib/migrations.ts`), con su propio binding D1. Usa la
misma tabla `d1_migrations` que `wrangler d1 migrations apply`, así que los
dos caminos son compatibles. Esto evita depender de que el token de Workers
Builds tenga permisos sobre D1, que por defecto no tiene.

## Configurar Cloudflare

1. Inicie sesión con `bunx wrangler login`.
2. Cree la base de datos y copie el `database_id` devuelto en
   `wrangler.jsonc` y en `wrangler.remote.jsonc` (este último solo lo usan los
   scripts locales con `--remote`):

```bash
bunx wrangler d1 create sijac
```

3. Cree el bucket privado de documentos:

```bash
bunx wrangler r2 bucket create sijac-private
```

4. Dé de alta el dominio del remitente para el envío de correos (requiere
   Workers Paid) y registre los secretos del Worker:

```bash
bunx wrangler email sending enable sijac.org
bunx wrangler secret put SETUP_CODE
# Opcional: si no existe, se genera y se guarda en D1.
bunx wrangler secret put BETTER_AUTH_SECRET
```

5. Despliegue (ver abajo) y abra `/configuracion-inicial` para crear el
   administrador. Como alternativa técnica, `bun run db:seed -- --remote`
   (con `SEED_ADMIN_PASSWORD`) crea cuentas y fichas de demostración.

El bucket R2 no tiene acceso público: los documentos solo se entregan a través
de la aplicación después de verificar la sesión.

## Variables

| Variable | Obligatoria | Uso |
|---|---:|---|
| `SETUP_CODE` | Para el asistente | Clave para crear el primer administrador |
| `BETTER_AUTH_SECRET` | No | Firma de cookies y tokens; sin ella se genera en D1 |
| `BETTER_AUTH_URL` | No | URL base fija; sin ella se usa el dominio de la solicitud |
| `NEXT_PUBLIC_APP_URL` | No | URL canónica fija para metadatos |
| `EMAIL_FROM` | No | Remitente; por defecto `SIJAC Aguadas <no-responder@sijac.org>` (en `vars`) |
| `RESEND_API_KEY` | No | Alternativa a Cloudflare Email Sending; solo se usa si se quita el binding `EMAIL` |
| `DEMO_MODE` | Solo local | Sustituye D1 por datos ficticios |
| `SEED_ADMIN_EMAIL` | No | Correo de cuenta inicial |
| `SEED_ADMIN_PASSWORD` | Producción | Contraseña inicial explícita |

La base de datos (`DB`), los documentos (`FILES`) y el correo (`EMAIL`) no
usan variables: son bindings declarados en `wrangler.jsonc`. En el Worker, las variables públicas
se definen en `vars` de `wrangler.jsonc` o en el panel de Cloudflare, y los
secretos con `wrangler secret put`.

## Correos transaccionales

Las invitaciones y recuperaciones usan componentes React Email mobile first,
incluyen texto de previsualización, botón accesible, URL de respaldo y versión
de texto plano. Para revisar las plantillas localmente:

```bash
bun run email:dev
```

La previsualización no envía mensajes. En `next dev` el binding `EMAIL` se
simula: el mensaje se registra en la consola y no se envía. En el Worker, los
correos salen por Cloudflare Email Sending desde `EMAIL_FROM`, cuyo dominio
debe estar dado de alta en Email Service. Si se quita el binding, la
aplicación usa Resend cuando hay una `RESEND_API_KEY` válida.

## Desplegar en Cloudflare Workers

1. Complete la sección «Configurar Cloudflare».
2. Las URL no hacen falta: la aplicación usa el dominio de cada solicitud.
   Defina `BETTER_AUTH_URL` o `NEXT_PUBLIC_APP_URL` solo si quiere fijar una.
3. Verifique que `DEMO_MODE` sea `false`.
4. Pruebe el Worker localmente y despliegue:

```bash
bun run preview
bun run deploy
```

En Workers Builds basta con los comandos predeterminados: `npm run build`
genera la salida de OpenNext cuando detecta `WORKERS_CI=1`, y
`npx wrangler deploy` la publica. `npm run deploy` también funciona como
comando de despliegue.

## Calidad

```bash
bun run lint
bun run typecheck
bun run build
```

La integración continua ejecuta estas validaciones en cada pull request.

## Importación y operación

- [Importación de las 68 JAC](docs/IMPORTACION.md)
- [Respaldo, restauración e incidentes](docs/OPERACION.md)
- [Seguridad y privacidad](docs/SEGURIDAD.md)

Los archivos reales de la memoria USB y el listado oficial no fueron
proporcionados al proyecto. No se inventaron datos productivos; la semilla usa
68 fichas claramente marcadas como demostrativas.
