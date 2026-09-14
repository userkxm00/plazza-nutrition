# External Reference Projects

These repositories are research references only. They are **not** automatically copied into Plazza Nutrition.

## CodFlow

Repository: `bighadj22/codflow`

Relevance: very high.

Useful ideas to study:

- COD-first Algerian commerce workflows.
- Unified delivery provider abstraction.
- ZR Express integration concepts.
- Inventory movements and low-stock handling.
- Order lifecycle.
- RBAC / permission scopes.
- Reviews and promotion engine.
- Customer CRM foundations.
- Webhooks and event logging.
- Meta Pixel / CAPI concepts for COD attribution.

The repository is Apache-2.0 licensed according to its GitHub metadata. Verify the exact license and any dependency licenses before reusing code. fileciteturn4file0

## OpenWA

Repository: `rmyndharis/OpenWA`

Relevance: future notification integration research.

Description indicates a self-hosted WhatsApp API Gateway. GitHub metadata reports MIT license. fileciteturn5file0

Do not make WhatsApp Web automation a critical production dependency until reliability, operating model and applicable WhatsApp policies are evaluated.

## openGym

Repository: `alexpcosta/opengym`

Relevance: low for the commerce core. It is a self-hosted gym/workout tracking application and is useful mainly as a reference for fitness-domain ideas that might be considered in a future content/community expansion. GitHub metadata reports AGPL-3.0 for the fork. fileciteturn6file0

Do not mix workout-tracking domain concepts into the commerce core unless there is a validated business requirement.

## android-sms-gateway

Repository: `capcom6/android-sms-gateway`

Relevance: future SMS provider research.

It exposes SMS sending/receiving through an Android-device/cloud-accessible API. GitHub metadata reports Apache-2.0. fileciteturn7file0

Treat this as a provider option behind a notification abstraction, not as a hard dependency in the core order workflow.

## Reuse policy

Before copying code from any external project:

1. Verify repository and file license.
2. Verify dependency licenses.
3. Record the source and exact files/components reused.
4. Prefer implementing our own domain logic over importing a whole application.
5. Keep third-party integrations behind adapters.
6. Document security and maintenance implications.
