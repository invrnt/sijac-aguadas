# SIJAC Aguadas

Sistema web responsive y PWA para administrar las 68 Juntas de Acción Comunal
de Aguadas, Caldas. Incluye fichas institucionales, dignatarios, convenios,
documentos privados, reuniones, actas, compromisos, actividades, reportes,
usuarios, roles y auditoría.

## Instalación guiada

Pensada para quien no es técnico: todo se hace en el navegador y no hay que
instalar nada en el equipo. Toma unos 30 minutos, casi todos de espera.

### Antes de empezar (una sola vez)

Hágalo en este orden con la misma persona y el mismo correo institucional:

1. **Cree una cuenta de GitHub** en [github.com/signup](https://github.com/signup).
   Cloudflare guarda allí una copia del sistema y la usa para publicarlo.
2. **Cree una cuenta de Cloudflare** en
   [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
3. **Active el plan Workers Paid** (USD 5 al mes; le pedirá una tarjeta):
   [Workers → Planes](https://dash.cloudflare.com/?to=/:account/workers/plans).
4. **Active R2**, donde se guardan los documentos (gratis hasta 10 GB):
   [R2 → Overview](https://dash.cloudflare.com/?to=/:account/r2/overview) y
   complete el proceso de compra que aparece.
5. **Compre el dominio `sijac.org`** en el
   [panel de Cloudflare](https://dash.cloudflare.com/): menú **Domain
   Registration → Register Domains**.
6. **Active el envío de correos** con ese dominio: menú **Email Service →
   Email Sending → Onboard Domain**, elija `sijac.org` y pulse **Add records
   and onboard**. Cloudflare crea solo los registros DNS; tardan entre 5 y 15
   minutos en quedar verificados.

### Publicar el sistema

7. Abra
   [Cloudflare → Crear aplicación desde un repositorio público](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers)
   y pegue esta dirección:

   ```
   https://github.com/invrnt/sijac-aguadas
   ```

   (Es lo mismo que pulsar este botón:
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/invrnt/sijac-aguadas))
8. Cuando lo pida, pulse **Connect GitHub** (o **Conectar GitHub**), inicie
   sesión con la cuenta del paso 1 y autorice a Cloudflare. Cloudflare crea
   allí su copia del repositorio.
9. En la página de configuración:
   - deje los nombres como están (`sijac-aguadas`, `sijac`, `sijac-private`);
   - en `SETUP_CODE` invente una **clave de instalación** de al menos 8
     caracteres y anótela;
   - pulse **Create and deploy** y espere a que termine (unos 5 minutos).
10. Abra la dirección que muestra Cloudflare
    (`https://sijac-aguadas.<su-subdominio>.workers.dev`). El sistema lo
    lleva al asistente de configuración inicial, que:
    - revisa la base de datos, los documentos y el correo, y le dice cómo
      corregir lo que falte con enlaces al panel de Cloudflare;
    - le pide la clave de instalación y crea **dos cuentas de
      administrador**, para que la entidad no se quede sin acceso si una
      persona olvida su contraseña o deja el cargo;
    - envía un correo de prueba a cada administrador.

Listo. Las tablas de la base de datos se crean solas en la primera visita, y
cada cambio que se suba a la copia del repositorio se vuelve a publicar solo.

> El repositorio `invrnt/sijac-aguadas` debe ser **público**: Cloudflare no
> puede copiar repositorios privados.

### Detalles técnicos de la instalación

- Los correos salen con el binding `EMAIL` (Cloudflare Email Sending), sin
  claves. El remitente es `EMAIL_FROM` en `vars` de `wrangler.jsonc`
  (`SIJAC Aguadas <no-responder@sijac.org>`); cámbielo si usa otro dominio.
- La clave de sesiones (`BETTER_AUTH_SECRET`) es opcional: si no se registra,
  la aplicación genera una y la guarda en D1.
- `SETUP_CODE` solo se usa una vez. Si se olvida antes de usar el asistente,
  se cambia en el proyecto `sijac-aguadas` → **Settings → Variables and
  Secrets**.

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
