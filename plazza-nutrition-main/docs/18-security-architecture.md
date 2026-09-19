# Plazza Nutrition — Security Architecture & Threat Model v0.1

> Status: design. Security requirements are defined before implementation.

## 1. Security objectives

Plazza Nutrition handles customer PII, staff accounts, orders, inventory, cash, profitability data, courier credentials and future payment integrations.

Primary goals:

1. Protect customer and staff data.
2. Prevent unauthorized changes to stock, money, orders and permissions.
3. Keep secrets outside source control and client-side code.
4. Make sensitive actions attributable and auditable.
5. Limit blast radius when an integration or account is compromised.
6. Preserve business integrity during retries, concurrent requests and provider failures.
7. Make security controls understandable enough to maintain over time.

## 2. Trust boundaries

```text
Public internet
   |
   v
Storefront / Public API
   |
   +--> Customer session
   |
   v
Backend application boundary
   |
   +--> PostgreSQL
   +--> Object storage
   +--> Background jobs
   +--> Admin API
   |
   +--> External providers
          +--> ZR Express
          +--> WhatsApp/SMS/email (future)
          +--> Payment providers (future)
```

External providers are untrusted dependencies. Their responses must be validated and must never directly overwrite core business state without domain validation.

## 3. Identity model

### Customer identity

Customers may use guest checkout or an account. Customer authentication must remain separate from staff authorization even if the same identity infrastructure is used.

### Staff identity

Staff users are authenticated separately and receive server-side roles/permissions.

Staff accounts require:

- unique identity;
- secure password/passkey strategy selected during implementation;
- session expiry and revocation;
- optional MFA capability for privileged users;
- account disable/revoke support;
- audit attribution for sensitive actions.

Owner-level access must not be treated as a magic boolean that bypasses server authorization.

## 4. Authorization model

Use RBAC with granular permissions.

Examples:

```text
orders.read
orders.confirm
orders.cancel
products.read
products.write
inventory.read
inventory.adjust
inventory.receive
returns.create
returns.approve
refunds.approve
pos.sell
pos.close_session
cash.reconcile
expenses.create
reports.profit
staff.manage
roles.manage
settings.manage
integrations.manage
```

Authorization requirements:

- checked on the server for every protected operation;
- UI hiding is not a security boundary;
- high-risk operations may require elevated permission and/or re-authentication;
- permission changes are audited;
- inactive staff cannot access protected resources.

## 5. Session and authentication requirements

The final authentication library/provider is implementation detail, but the contract requires:

- secure, httpOnly, same-site session handling where cookie sessions are used;
- TLS in production;
- no long-lived secrets in browser storage unless a documented need exists;
- session revocation on account disable/password reset where applicable;
- protection against session fixation;
- appropriate CSRF defenses for cookie-authenticated state-changing requests;
- rate limiting on login and sensitive authentication endpoints;
- password credentials, if supported, stored only as modern slow password hashes through a vetted library.

Privileged admin authentication should support stronger controls than public customer checkout.

## 6. Data classification

### Public

Product names, public prices, product images, public category/brand data.

### Internal

Inventory quantities, purchase costs, supplier information, internal reports.

### Confidential

Customer phone/address/order history, staff identities, profit reports, expenses, integration credentials.

### Secret

Database credentials, session/auth secrets, API keys, webhook signing secrets, storage credentials and payment credentials.

Secrets must never be committed to Git, embedded in frontend bundles or logged.

## 7. Threat model

### T1 — Unauthorized admin access

Impact: full business compromise.

Controls:

- strong staff authentication;
- RBAC;
- MFA capability for privileged roles;
- rate limiting;
- session revocation;
- audit logs;
- least privilege.

### T2 — Broken object authorization / IDOR

Example: changing `/orders/:id` to access another customer's order.

Controls:

- every resource query scoped to authenticated principal/role;
- never rely on opaque IDs alone for authorization;
- explicit ownership checks;
- separate admin and customer access policies.

### T3 — Checkout price/stock tampering

Attacker changes price, quantity, discount or shipping in the browser.

Controls:

- backend calculates totals;
- backend resolves product price/current promotion;
- backend validates inventory;
- client totals are informational only;
- atomic order transaction;
- idempotency key.

### T4 — Overselling / race condition

Two requests attempt to buy the last unit.

Controls:

- database transaction;
- row-level locking or an equivalent concurrency strategy;
- inventory reservation/availability policy;
- unique/idempotency constraints;
- integration tests for concurrent requests.

### T5 — Duplicate webhook

ZR or another provider retries the same event.

Controls:

- provider event identifier persisted;
- idempotent processing;
- transactionally record processing outcome;
- never blindly increment/decrement stock per webhook.

### T6 — Fake or forged webhook

Attacker calls a public webhook endpoint.

Controls:

- verify provider signature/HMAC when supported;
- constant-time signature comparison;
- timestamp/replay controls where supported;
- reject malformed events;
- rate limiting;
- event audit trail.

### T7 — File upload abuse

Malicious product images or oversized files.

Controls:

- allowlist MIME/type and extension;
- size limits;
- generated storage keys;
- server-side metadata validation;
- no executable upload paths;
- image processing/isolation where appropriate;
- storage credentials never exposed to browser.

### T8 — SQL injection / unsafe query construction

Controls:

- parameterized queries through ORM/query builder;
- no string-concatenated SQL from user input;
- input validation;
- least-privilege DB role.

### T9 — XSS through product/review/admin content

Controls:

- output encoding;
- safe rich-text policy if any HTML is supported;
- sanitize imported/user content;
- strict CSP where practical;
- avoid unsafe HTML injection.

### T10 — Abuse of checkout / bot orders

Controls:

- rate limiting;
- request validation;
- optional bot challenge;
- duplicate-order detection/idempotency;
- monitoring abnormal order volume;
- configurable phone/contact verification later.

### T11 — Secret leakage

Controls:

- environment/secret manager;
- secret scanning in CI;
- redacted logs;
- separate dev/staging/production credentials;
- rotate compromised credentials.

### T12 — Insider abuse

Example: employee changes prices or stock without authorization.

Controls:

- least privilege;
- granular permissions;
- audit logs with actor + before/after values;
- high-risk action approval where justified;
- session revocation.

### T13 — Financial manipulation

Controls:

- immutable transaction history;
- no deletion of finalized sales;
- controlled refunds;
- cash-session close rules;
- exact money arithmetic;
- audit trails;
- reconciliations.

### T14 — Supply-chain / dependency compromise

Controls:

- lockfiles;
- dependency updates through review;
- automated vulnerability scanning;
- avoid unnecessary packages;
- review third-party integrations.

## 8. API security baseline

Every protected endpoint must define:

- authentication requirement;
- authorization permission;
- input schema validation;
- resource ownership/scope;
- transaction boundary;
- idempotency requirement;
- rate-limit class where applicable;
- structured error behavior;
- audit requirement.

Do not expose raw database errors, stack traces, secrets or internal provider responses to clients.

## 9. Webhook security

All provider webhooks must be treated as untrusted input.

Pipeline:

```text
HTTP request
  -> parse safely
  -> verify authenticity
  -> validate schema
  -> check replay/idempotency
  -> map external event to internal event
  -> transactionally apply allowed state change
  -> record processing result
  -> enqueue non-critical side effects
```

Webhook processing must be safe to retry.

## 10. Database security

- private network access where infrastructure supports it;
- application DB user gets only required permissions;
- migrations use a controlled deployment identity;
- backups encrypted and access controlled;
- no production DB credentials in local source files committed to Git;
- audit/security monitoring for privileged operations where available.

## 11. Privacy boundaries

Collect only customer information needed for fulfillment, communication and business operations.

Do not log full phone numbers, addresses, authentication secrets or payment credentials unnecessarily.

Application logs should use redaction/masking for sensitive fields.

Retention/deletion policies will be defined with the owner and applicable legal requirements before production launch.

## 12. Security of financial operations

Sensitive operations include:

- price changes;
- discounts above configured threshold;
- manual stock adjustment;
- refunds;
- return approval;
- cash withdrawal;
- cash reconciliation;
- expense edits/deletion;
- role/permission changes.

These operations must be permission-controlled and audited.

## 13. Admin security posture

The admin surface is the highest-risk application area.

Recommended controls:

- separate admin route/application boundary;
- no indexing by search engines;
- strong authentication;
- session timeout;
- optional MFA for Owner/Manager;
- server-side RBAC;
- audit log;
- re-authentication for very sensitive operations;
- stricter rate limits;
- security headers.

## 14. Security headers / browser protections

Production should configure appropriate headers, including as applicable:

- Content-Security-Policy;
- Strict-Transport-Security;
- X-Content-Type-Options;
- Referrer-Policy;
- frame-ancestors / clickjacking protection;
- Permissions-Policy.

The exact CSP must be compatible with analytics, payment and image/CDN providers and tested before enforcement.

## 15. Logging and monitoring

Structured logs should include correlation/request IDs and operational context, while avoiding sensitive data.

Monitor at minimum:

- authentication failures;
- authorization denials;
- order creation failures;
- payment/refund failures;
- inventory conflicts;
- webhook failures;
- provider outages;
- background job failures;
- suspicious request volume;
- repeated 5xx responses.

## 16. Incident response basics

Production documentation must include:

1. revoke/rotate credentials;
2. disable compromised staff account;
3. identify affected records/events;
4. preserve relevant audit/log evidence;
5. restore from known-good backup only when necessary;
6. communicate with owner;
7. document root cause and remediation.

## 17. Security testing

Before production:

- unit tests for authorization policies;
- integration tests for sensitive transactions;
- webhook signature/idempotency tests;
- concurrency tests for inventory/order paths;
- input validation tests;
- E2E auth/RBAC tests;
- dependency vulnerability checks;
- secret scanning;
- manual security review of admin/API flows.

## 18. Security non-goals

The application is not intended to be a banking platform or certified accounting system.

Do not implement custom cryptography, custom password hashing, or custom payment cryptographic protocols when vetted standards/libraries exist.

## 19. Pre-production security checklist

- [ ] Production secrets stored outside Git
- [ ] Staff RBAC verified
- [ ] Owner/privileged MFA decision completed
- [ ] Session/cookie settings reviewed
- [ ] CSRF strategy verified for cookie-authenticated mutations
- [ ] Rate limits enabled
- [ ] Webhook verification enabled
- [ ] Idempotency implemented on required endpoints
- [ ] Audit logs verified
- [ ] Financial mutation permissions tested
- [ ] Database least-privilege reviewed
- [ ] Backups tested by restore, not just created
- [ ] Error responses do not leak internals
- [ ] Security headers configured
- [ ] Dependency and secret scans passing
- [ ] Production logging redaction verified
