# Plazza Nutrition — Deployment & Infrastructure Architecture v0.1

> Status: proposed production architecture. Accounts and paid resources belong to the merchant in production.

## 1. Goals

The production platform must be:

- reliable enough for real orders and inventory;
- recoverable after accidental deletion or infrastructure failure;
- portable enough to avoid unnecessary vendor lock-in;
- affordable for a small Algerian retailer;
- easy for one developer to operate initially;
- separable into staging and production;
- observable without exposing customer or secret data.

## 2. Environments

### Local development

Developer machine only. No customer data. Local PostgreSQL and local object-storage/test doubles may be used.

### Staging

A separate environment used for migrations, integration testing, ZR sandbox/testing where available, release verification and demo work.

### Production

The merchant's live environment. Production resources, domain, database, storage and third-party provider accounts should be owned by the merchant.

## 3. Proposed production topology

```text
Internet
   |
   +--> DNS / CDN / TLS
   |
   +--> Next.js Storefront + Admin Web
   |       |
   |       +--> NestJS API
   |               |
   |               +--> PostgreSQL
   |               +--> Redis / job infrastructure (when needed)
   |               +--> S3-compatible object storage
   |               +--> ZR Express integration
   |               +--> notification providers
   |
   +--> Monitoring / error tracking
```

## 4. Initial hosting recommendation

### Web

Use Vercel as the first production host for the Next.js web application unless a later requirement makes self-hosting preferable. Next.js is a first-class Vercel platform workload, but the application must not depend on Vercel-specific business logic so it can be moved later.

### API

Deploy NestJS as a Dockerized application. An initial managed container platform is preferred over operating a raw VPS alone. A VPS remains a cost-optimized alternative once the operator is comfortable owning system updates, firewalling, monitoring and recovery.

### Database

Use managed PostgreSQL for production. The initial recommended option is a paid managed PostgreSQL service with point-in-time recovery rather than a free/sleeping database. Render Postgres is one viable option because paid instances provide PITR and logical exports; AWS RDS is a higher-complexity alternative with PITR and broader infrastructure options.

The application remains PostgreSQL-compatible and does not rely on provider-specific SQL features unless explicitly documented.

### Object storage

Use S3-compatible object storage for product images and generated documents. Cloudflare R2 is the preferred initial option because it exposes an S3-compatible API, allowing use of standard S3 SDKs rather than a provider-specific application API.

## 5. Production ownership

The merchant owns:

- domain;
- Vercel/hosting account;
- production PostgreSQL account;
- object-storage account;
- ZR Express merchant account/API credentials;
- future payment accounts;
- business notification accounts.

The developer receives the minimum access required to operate the system.

This prevents production ownership from being trapped in the developer's personal accounts.

## 6. Secrets and configuration

Secrets are never committed to Git.

Examples:

- DATABASE_URL
- SESSION_SECRET
- AUTH secrets
- ZR API credentials
- webhook signing secrets
- object-storage credentials
- notification provider credentials
- future payment credentials

Use separate credentials for staging and production.

## 7. Database reliability

Production PostgreSQL must provide:

- encrypted connections;
- automated backups;
- point-in-time recovery where the selected plan supports it;
- logical backup/export capability;
- documented restore procedure;
- migration history in Git.

A backup is not considered complete until a restore procedure has been tested.

## 8. Backup policy

Initial target:

- managed provider PITR enabled;
- scheduled logical export at least daily;
- additional pre-migration backup;
- backup copies stored outside the primary database service when practical;
- periodic restore verification.

Retention should be selected according to the merchant's operational risk and budget.

## 9. Object-storage reliability

Product images and generated files live outside PostgreSQL. Database rows store object identifiers/metadata, not large binary payloads.

Deletion must be coordinated so a database record is not removed while a required file remains orphaned without a recovery/cleanup plan.

## 10. CI/CD

GitHub Actions should eventually perform:

```text
pull request
  -> install
  -> lint
  -> typecheck
  -> unit tests
  -> integration tests
  -> build
  -> migration validation
```

A merge to the production branch should produce a deployable artifact and trigger deployment only after required checks succeed.

Production database migrations must be explicit and reviewable; application startup should not blindly mutate the production schema.

## 11. Deployment strategy

### Staging

Every meaningful release is first deployed to staging.

Run:

- smoke tests;
- API health checks;
- migration checks;
- critical checkout/order tests;
- inventory/POS tests;
- ZR integration checks where possible.

### Production

Use an explicit release step.

Preferred sequence:

```text
build artifact
  -> deploy application
  -> run reviewed migration
  -> health check
  -> smoke test
  -> observe
```

A rollback plan must exist for both application and database changes. Destructive database migrations require special handling and should generally be split into expand/contract phases.

## 12. Health checks

The API should expose a health endpoint that distinguishes at least:

- application process health;
- database connectivity;
- critical dependency availability where appropriate.

Do not expose secrets, credentials or detailed internal errors through health endpoints.

## 13. Monitoring

Minimum production monitoring:

- application error rate;
- HTTP 5xx rate;
- latency;
- database connection failures;
- failed background jobs;
- failed ZR webhooks/API operations;
- duplicate/idempotency conflicts;
- order creation failures;
- inventory transaction failures;
- backup status;
- disk/storage/resource saturation.

Alerts should be based on operational impact, not every warning.

## 14. Logging

Use structured logs with:

- timestamp;
- environment;
- request/correlation ID;
- actor ID when appropriate;
- module/event;
- severity;
- safe contextual identifiers.

Never log passwords, session secrets, API tokens, payment credentials or full sensitive customer data unnecessarily.

## 15. Background jobs

Background jobs are required for tasks such as:

- notifications;
- webhook retries;
- periodic cleanup;
- report generation;
- backup jobs where application-owned jobs are appropriate;
- synchronization with providers.

Critical workflows must not depend on an unreliable in-process timer. The job system should support retry, backoff and idempotency.

## 16. CDN and caching

Cache public product/media content where safe.

Never cache personalized admin responses, checkout state, customer account data or sensitive order information in a shared cache.

## 17. File uploads

Product images should be uploaded using controlled server-issued or short-lived signed URLs where appropriate.

Validate:

- file size;
- MIME type/content type;
- extension;
- image dimensions;
- malicious payloads where applicable.

Do not allow arbitrary executable files into public buckets.

## 18. Domain and TLS

Production should use the merchant's own domain and HTTPS.

Recommended structure:

```text
www.<domain>          -> storefront
api.<domain>          -> NestJS API
admin.<domain>/...    -> protected admin UI or dedicated admin route
```

The final domain structure is still a deployment detail and can be simplified if the chosen hosting architecture makes a different arrangement preferable.

## 19. Disaster recovery targets

Initial targets should be explicit before production:

- **RPO:** target maximum tolerable data loss.
- **RTO:** target maximum tolerable recovery time.

For a small first deployment, a practical target is to recover the application and database within hours rather than designing expensive multi-region infrastructure immediately. These targets should be tightened if business volume later justifies the cost.

## 20. Cost discipline

No production dependency should be selected merely because it has a free tier.

Free tiers are acceptable for development, prototypes and staging when their limitations are known.

Production resources are part of the client's operating cost and should be presented separately from development fees.

## 21. Provider isolation

The application should encapsulate provider-specific code behind interfaces/modules:

```text
StorageProvider
DeliveryProvider
NotificationProvider
PaymentProvider
```

This allows the system to replace R2, ZR Express, WhatsApp/SMS providers or future payment services without rewriting core business logic.

## 22. Initial recommended production shape

```text
                 Merchant Domain
                       |
                 Cloudflare DNS/CDN
                       |
              +--------+--------+
              |                 |
          Next.js            API domain
          on Vercel             |
                                |
                           NestJS Docker
                                |
                 +--------------+--------------+
                 |              |              |
             PostgreSQL       R2        Job/Queue layer
             managed         storage       as needed
                 |
             backups/PITR

External:
  ZR Express
  future payment providers
  future WhatsApp/SMS/email
```

This is intentionally not a multi-region or Kubernetes architecture. The current business does not justify that operational complexity. The design leaves room to scale the API, database and background workers later.

## 23. Deployment decision gates

Before production go-live, confirm:

- domain owned by merchant;
- billing account owned by merchant;
- production database paid plan with recovery features;
- backups tested;
- secrets configured outside Git;
- staging passed critical tests;
- monitoring/alerts working;
- ZR integration tested and manual fallback documented;
- production migration procedure reviewed;
- rollback/recovery runbook available;
- owner knows who is responsible for ongoing maintenance.
