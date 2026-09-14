# Webhook Ingress & Idempotency

## Purpose
Define a durable boundary between external provider webhooks and internal business processing.

## Problem
External providers such as ZR Express may retry events, deliver duplicate notifications, change delivery timing, or send events while the application is temporarily unavailable. Business state must not depend on receiving an event exactly once.

## Proposed flow

```text
Provider webhook
      ↓
Authenticate/signature check
      ↓
Webhook ingress record
      ↓
Deduplication / idempotency check
      ↓
Safely acknowledge accepted ingress
      ↓
Async processing
      ↓
Domain state update
      ↓
Normalized tracking/event record
```

## Durable ingress record
Add a conceptual `provider_webhook_events` table/entity with at least:

- provider/integration id;
- provider event id when supplied;
- event type;
- received_at;
- signature verification status;
- deduplication key;
- processing status;
- processing attempts;
- processed_at;
- failure reason safe for diagnostics;
- raw payload or a controlled reference to retained payload data.

Sensitive credentials and secrets must never be stored in raw payloads unless the retention/security policy explicitly permits the specific field.

## Idempotency rules

A duplicate webhook must not:

- create a second shipment;
- create a second stock movement;
- duplicate a return/refund;
- move an order through a state transition twice in a harmful way;
- create duplicate notifications that represent one business event.

Provider event identifiers should be used where guaranteed; otherwise use a documented provider-specific deduplication fingerprint.

## Failure handling

Processing failure must be observable and retryable. A failed webhook should remain inspectable without causing the provider request to trigger repeated business mutations blindly.

Use bounded retries. After the configured maximum attempts, move the event to a **dead-letter / manual-review state** with enough diagnostics to safely retry or resolve it later.

Unknown event types should be safely recorded and surfaced for review rather than silently discarded.

### Signature verification failures

Repeated signature/authentication failures must raise an operational/security alert rather than being treated as ordinary processing errors. The system should retain only the diagnostic data permitted by the webhook retention policy.

## Raw payload retention

Raw webhook payloads may contain personally identifiable information such as names, phone numbers or addresses. Define a documented retention period and access policy before production webhooks are enabled.

Prefer storing only the minimum raw payload/reference needed for debugging and replay. Retained payloads must be access-controlled and excluded from ordinary application logs.

## Relationship to local truth
The webhook is evidence from an external provider. The application remains authoritative for local order/shipment records. Provider-specific events are normalized into the local delivery/tracking domain.

## V1 requirement
Implement the ingress/idempotency model before production ZR webhooks are enabled. Manual shipment/tracking fallback remains available when the provider integration is unavailable.
