# SIJAC Aguadas

Sistema web responsive y PWA para administrar las 68 Juntas de Acción Comunal
de Aguadas, Caldas. Incluye fichas institucionales, dignatarios, convenios,
documentos privados, reuniones, actas, compromisos, actividades, reportes,
usuarios, roles y auditoría.

## Stack

- Next.js 16, React 19 y TypeScript
- Better Auth para cuentas, sesiones, recuperación, bloqueo y roles
- Cloudflare D1 (SQLite) con Drizzle ORM
- Cloudflare R2 privado para documentos
- React Email y Resend para correos transaccionales responsive
- Bun como gestor de paquetes y ejecutor de scripts
- Cloudflare Workers como destino de despliegue mediante OpenNext

## Inicio local

Requisitos: Bun 1.3 o superior y Node.js 22.13 o superior (wrangler y OpenNext
se ejecutan sobre Node).

```bash
bun install
copy .env.example .env.local
bun run db:generate
bun run db:migrate:local
bun run db:seed
bun run dev
```

`next dev` usa una base D1 y un bucket R2 locales guardados en `.wrangler/`.
Con `DEMO_MODE=true` la aplicación ofrece acceso local como Administrador o
Consulta y usa exclusivamente datos ficticios, sin tocar D1.

`bun run db:generate` crea la migración SQL en `drizzle/` a partir de
`db/schema.ts`. Ejecútelo cada vez que cambie el esquema y versione el
resultado.

## Configurar Cloudflare

1. Inicie sesión con `bunx wrangler login`.
2. Cree la base de datos y copie el `database_id` devuelto en las dos entradas
   `d1_databases` de `wrangler.jsonc`:

```bash
bunx wrangler d1 create sijac
```

3. Cree el bucket privado de documentos:

```bash
bunx wrangler r2 bucket create sijac-private
```

4. Aplique las migraciones y cargue las cuentas iniciales en producción:

```bash
bun run db:migrate:remote
bun run db:seed -- --remote
```

5. Registre los secretos del Worker:

```bash
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put RESEND_API_KEY
```

El bucket R2 no tiene acceso público: los documentos solo se entregan a través
de la aplicación después de verificar la sesión.

## Variables

| Variable | Obligatoria | Uso |
|---|---:|---|
| `BETTER_AUTH_SECRET` | Producción | Firma de cookies y tokens |
| `BETTER_AUTH_URL` | Sí | URL base de autenticación |
| `NEXT_PUBLIC_APP_URL` | Sí | URL canónica y metadatos |
| `EMAIL_FROM` | Para correo real | Remitente autorizado |
| `DEMO_MODE` | Solo local | Sustituye D1 por datos ficticios |
| `SEED_ADMIN_EMAIL` | No | Correo de cuenta inicial |
| `SEED_ADMIN_PASSWORD` | Producción | Contraseña inicial explícita |

La base de datos (`DB`) y los documentos (`FILES`) no usan variables: son
bindings declarados en `wrangler.jsonc`. En el Worker, las variables públicas
se definen en `vars` de `wrangler.jsonc` o en el panel de Cloudflare, y los
secretos con `wrangler secret put`.

## Correos transaccionales

Las invitaciones y recuperaciones usan componentes React Email mobile first,
incluyen texto de previsualización, botón accesible, URL de respaldo y versión
de texto plano. Para revisar las plantillas localmente:

```bash
bun run email:dev
```

La previsualización no envía mensajes. El envío real requiere `RESEND_API_KEY`
y un remitente verificado en `EMAIL_FROM`.

## Desplegar en Cloudflare Workers

1. Complete la sección «Configurar Cloudflare».
2. Defina `NEXT_PUBLIC_APP_URL` y `BETTER_AUTH_URL` con el dominio HTTPS del
   Worker; `NEXT_PUBLIC_APP_URL` se incorpora al compilar, así que debe estar
   en `.env.production` o en el entorno de la compilación.
3. Verifique que `DEMO_MODE` sea `false`.
4. Pruebe el Worker localmente y despliegue:

```bash
bun run preview
bun run deploy
```

Aplique `bun run db:migrate:remote` antes de desplegar cualquier versión que
incluya migraciones nuevas.

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
