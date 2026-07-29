# SIJAC Aguadas

Sistema web responsive y PWA para administrar las 68 Juntas de Acción Comunal
de Aguadas, Caldas. Incluye fichas institucionales, dignatarios, convenios,
documentos privados, reuniones, actas, compromisos, actividades, reportes,
usuarios, roles y auditoría.

## Stack

- Next.js 16, React 19 y TypeScript
- Better Auth para cuentas, sesiones, recuperación, bloqueo y roles
- PostgreSQL de Supabase con Drizzle ORM
- Supabase Storage privado
- React Email y Resend para correos transaccionales responsive
- Bun como gestor, runtime local y ejecutor de pruebas
- Vercel como destino de despliegue

## Inicio local

Requisitos: Bun 1.3 o superior.

```bash
bun install
copy .env.example .env.local
bun run dev
```

Con `DEMO_MODE=true` y sin `DATABASE_URL`, la aplicación ofrece acceso local
como Administrador o Consulta y usa exclusivamente datos ficticios.

## Conectar Supabase

1. Cree un proyecto en Supabase.
2. Copie la URL del pooler de PostgreSQL a `DATABASE_URL`.
3. Defina `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Genere un secreto de 32 caracteres o más para `BETTER_AUTH_SECRET`.
5. Ejecute:

```bash
bun run db:migrate
bun run setup:storage
bun run db:seed
```

La clave `service_role` solo debe existir en variables del servidor. Nunca use
la clave pública para administrar archivos privados ni exponga `service_role`
con el prefijo `NEXT_PUBLIC_`.

## Variables

| Variable | Obligatoria | Uso |
|---|---:|---|
| `DATABASE_URL` | Producción | URL PostgreSQL del pooler de Supabase |
| `BETTER_AUTH_SECRET` | Producción | Firma de cookies y tokens |
| `BETTER_AUTH_URL` | Sí | URL base de autenticación |
| `NEXT_PUBLIC_APP_URL` | Sí | URL canónica y metadatos |
| `SUPABASE_URL` | Producción | API del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | Producción | Storage privado desde servidor |
| `SUPABASE_STORAGE_BUCKET` | No | Predeterminado: `sijac-private` |
| `RESEND_API_KEY` | Para correo real | Recuperación e invitaciones |
| `EMAIL_FROM` | Para correo real | Remitente autorizado |
| `DEMO_MODE` | Solo local | Habilita la demostración sin base de datos |
| `SEED_ADMIN_EMAIL` | No | Correo de cuenta inicial |
| `SEED_ADMIN_PASSWORD` | Producción | Contraseña inicial explícita |

## Correos transaccionales

Las invitaciones y recuperaciones usan componentes React Email mobile first,
incluyen texto de previsualización, botón accesible, URL de respaldo y versión
de texto plano. Para revisar las plantillas localmente:

```bash
bun run email:dev
```

La previsualización no envía mensajes. El envío real requiere `RESEND_API_KEY`
y un remitente verificado en `EMAIL_FROM`.

## Desplegar en Vercel

1. Publique este repositorio en su proveedor Git.
2. Importe el repositorio en Vercel.
3. Configure las variables anteriores para Production y Preview.
4. Verifique que `NEXT_PUBLIC_APP_URL` y `BETTER_AUTH_URL` usen el dominio HTTPS.
5. Despliegue. Vercel detecta Next.js y usa Bun según `vercel.json`.
6. Ejecute las migraciones contra Supabase antes del primer acceso productivo.
7. Cambie `DEMO_MODE` a `false`.

## Calidad

```bash
bun run lint
bun run typecheck
bun test
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
