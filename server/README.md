# Identity API

Authentication and tenant provisioning service built with Node 20+, Express 5, and Sequelize/Postgres.

## Run

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.
3. Use different, randomly generated JWT secrets of at least 32 characters in production. Set `SETUP_KEY` before exposing first-time setup publicly.
4. Set `DB_SYNC=true` for initial schema creation, then start with `npm start` (or `npm run dev` for development).

The first admin account is created once through the first-time setup endpoint. Alternatively, create it with `npm run create-admin -- --email admin@example.com --name "Admin"`.

## API surface

All API routes are under `/api`.

| Area | Routes |
|---|---|
| Authentication | `GET /auth/csrf`, `GET /auth/setup-status`, `POST /auth/setup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/2fa/setup`, `POST /auth/2fa/enable`, `POST /auth/2fa/disable` |
| Accounts | `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`, `PATCH /users/me` |
| Tenants | Optional multi-tenant mode: `POST /tenants/signup`, `GET /tenants`, `GET /tenants/:id`, `PATCH /tenants/:id`, `DELETE /tenants/:id` |

Accounts use `admin` and `staff` roles. Admins can create accounts, reset passwords, unlock accounts, and deactivate users; each user can update their own profile and password. Password hashes and authentication secrets are never included in user responses.

Cookie-based writes to account and tenant management routes require a CSRF token from `GET /api/auth/csrf`, sent in `X-CSRF-Token`. Bearer-token clients are exempt from the CSRF header. Login sessions use short-lived access cookies and rotating refresh cookies; MFA, login throttling, lockouts, and audit events are included.

## Tenants

Multi-tenant mode is off by default. To enable it, set `MULTI_TENANT_ENABLED=true`, configure `REGISTRY_DATABASE_URL` (or use `DATABASE_URL`), set `MASTER_ENCRYPTION_KEY`, and use a `TENANT_DB_PREFIX` that fits within PostgreSQL's database-name limit. The database role must be allowed to create databases. Tenant clients must send their tenant subdomain in the `X-Tenant-ID` header. Each new tenant database receives only identity tables; tenant deletion suspends access and does not drop its database.

Tenant signup accepts `{ name, subdomain, adminName, adminEmail, adminPassword }`. Tenant subdomains are unique alphanumeric identifiers. Tenant management is limited to platform admins, not tenant-local admins.

## Data and upgrades

The service creates the `users`, `settings`, and `activity_log` tables. On existing databases, schema sync does not drop legacy tables or delete existing data, but the removed commerce endpoints and models are no longer available. Back up existing data before deployment and remove legacy tables separately only if you have verified they are no longer needed.

## Tests

Tests require `TEST_DATABASE_URL` to point to a dedicated disposable Postgres database. The test suite force-recreates its tables; never point it at production or any database containing data you need to keep.

```powershell
$env:TEST_DATABASE_URL = 'postgres://user:pass@localhost:5432/identity_test'
npm test
```

## Deployment

Use HTTPS in production. Health checks are available at `/health` and `/health/ready`. Docker builds with `docker build -t identity-api .` and starts using `npm start`.