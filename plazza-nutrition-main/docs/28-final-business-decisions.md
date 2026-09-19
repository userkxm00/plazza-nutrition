# Plazza Nutrition — Final Business Decisions v1.0

> Status: **Decision set approved for implementation.**
>
> This document closes the remaining business-policy questions identified by the final architecture audit. An implementation agent must follow these decisions and must not silently replace them.

## 1. COD stock reservation

### Decision
A customer cart or newly created `PENDING` COD order does **not** create an authoritative stock reservation.

Stock becomes reserved/committed atomically when the order is **confirmed** by the approved order workflow.

### Rules

- Cart quantity is advisory only.
- `PENDING` orders do not reduce sellable stock.
- Confirmation performs a transactional availability check and creates the required reservation/stock commitment.
- If stock is no longer available, confirmation fails safely and the order is not confirmed.
- POS sales consume stock immediately inside the POS transaction.
- There is no automatic long-lived hold for unconfirmed COD orders.
- A future soft-hold mechanism may be added only through a new ADR if real business evidence requires it.

### Reason
This protects the store from fake/abandoned COD orders consuming scarce stock while keeping the final confirmation step safe against two users competing for the last item.

---

## 2. Inventory costing / COGS

### Decision
Use **perpetual moving weighted-average cost per variant and stock location** as the authoritative operational COGS method.

### Rules

- Each received purchase updates the weighted-average unit cost for the applicable variant/location.
- A sale records the effective unit cost used for COGS at the time of posting.
- Historical COGS never changes because a later purchase has a different cost.
- Batch/lot tracking remains a physical inventory and expiry-control mechanism.
- FEFO is used for physical picking of expiry-tracked stock where appropriate; FEFO does not change the chosen accounting/management costing method.
- Returns restore inventory according to the return workflow and record the corresponding financial effect rather than rewriting the original sale.

### Reason
The store is currently one main stock location. Moving weighted average gives stable and understandable margin reporting while avoiding unnecessary accounting complexity. Batch/expiry can remain operationally precise without forcing the whole profitability model to become batch-cost driven.

---

## 3. Returns and COD refunds

### Decision
Use a default **15-calendar-day return-request window from confirmed delivery**, subject to the store's published eligibility rules and applicable Algerian consumer/e-commerce law.

### Rules

- The original order/sale must be traceable.
- Return requests are reviewed and receive an explicit approval/rejection decision.
- Product condition and product category rules are configurable/published; consumable/safety-sensitive exceptions must be validated before launch.
- Approved refunds never destructively rewrite the original payment.
- For COD orders, a refund is handled through an approved refund workflow such as bank/CCP/BaridiMob or controlled in-store cash refund, according to the merchant's published procedure.
- The courier is not treated as the accounting owner of the refund.
- Every refund records actor, amount, reason, method and reference where applicable.

### Legal note
Algerian e-commerce rules require the seller to define return conditions and prescribe a refund framework; exact legal treatment of individual product categories and exceptions must be validated with the merchant's qualified legal/accounting adviser before production. The system therefore supports the 15-day default as the operational policy while keeping eligibility rules configurable.

---

## 4. Exchanges and price differences

### Decision
Exchanges are allowed within the same default 15-calendar-day window, subject to the published eligibility rules.

### Price difference rules

- Replacement item costs **more**: customer pays the difference before completion.
- Replacement item costs **less**: store owes the difference and records a refund/credit according to the approved refund method.
- Same value: no additional payment or refund.
- Exchange is a new inventory/financial event linked to the original sale; the original sale is never edited destructively.

---

## 5. Failed delivery / return-to-sender cost allocation

### Decision
For standard COD orders, the merchant absorbs the courier cost caused by a failed delivery/return-to-sender event as an operational delivery cost/loss.

### Rules

- Customer-paid shipping revenue is recorded only when actually charged/collected.
- Courier outbound/return charges actually incurred remain attached to the order/shipment as merchant delivery cost.
- A failed delivery must not silently become product COGS.
- A configurable customer-risk flag may be recorded after repeated refusals/cancellations, but automatic rejection/scoring is out of scope for V1.

### Reason
This keeps profitability truthful and prevents delivery failures from disappearing into product cost or being incorrectly counted as collected customer revenue.

---

## 6. Order, invoice and receipt numbering

### Decision
Use separate immutable business identifiers for each document family.

Recommended initial formats:

```text
Order:   PLZ-ORD-YYYY-000001
Invoice: PLZ-INV-YYYY-000001
Receipt: PLZ-RCP-YYYY-000001
```

### Rules

- Sequences are monotonic within each document family.
- A number is never reused after issuance.
- Cancellation does not reuse the number.
- Internal database IDs remain separate from human-facing numbers.
- Prefix and numbering policy are configurable before production activation.
- The final invoice layout and legally required fields must be validated against the merchant's tax/accounting status before production use.

---

## 7. ZR Express integration decision

### Decision
ZR Express is the initial courier provider, but the project will implement against a **provider adapter contract**, not guessed endpoints or undocumented payloads.

### Rules

- The Delivery module owns the internal shipment model.
- ZR identifiers are integration identifiers, not primary order identity.
- Shipment creation, tracking, webhook ingestion and rate synchronization are provider adapter responsibilities.
- The local database remains authoritative for local order/shipment workflow state.
- Manual dispatch/tracking remains available as fallback.
- Production ZR integration is enabled only after the merchant provides valid account credentials and access to the current API reference/webhook contract.
- Webhook signature/authentication must be implemented according to the actual merchant-specific ZR documentation available at integration time.
- The system must not infer or hardcode unsupported ZR capabilities.

Current ZR public materials confirm an API-based e-commerce integration and webhook capability, while merchant-specific API details still need to be validated against the actual account/reference supplied for this project.

---

## 8. Product and supplement attributes

### Decision
The catalog must support a structured supplement profile while allowing ordinary gym products to use the same catalog safely.

### Minimum business-level fields

- brand
- product name in Arabic/French
- short/long description
- category
- images
- variant identity
- SKU
- barcode(s)
- size / net quantity
- flavor where applicable
- servings per container where applicable
- serving size where applicable
- ingredients
- nutrition facts where applicable
- directions / usage
- warnings / allergens where applicable
- manufacturer/brand origin metadata where needed
- product weight/dimensions when relevant to delivery
- batch/expiry tracking requirement flag
- active/published status

### Rule
The implementation should prefer structured fields for facts that must be searched, filtered, validated or reported, while flexible content may be stored in a structured extensible attribute model. The coding agent must not invent dozens of product fields without a documented catalog decision.

---

## 9. Staff roles and permission baseline

### Final initial roles

```text
OWNER
MANAGER
ORDER_OPERATOR
CASHIER
WAREHOUSE_OPERATOR
FINANCE
```

### Baseline responsibilities

**OWNER**
- Full business access.
- User/role management.
- Security/settings.
- Financial/profit visibility.
- Final authority for sensitive overrides.

**MANAGER**
- Orders, customers, catalog, inventory operations and operational reports.
- May approve configured operational exceptions.
- No authority to grant owner-level security rights.

**ORDER_OPERATOR**
- Customer/order processing.
- Confirmation/cancellation/fulfillment workflow within granted permissions.
- Shipment preparation/manual dispatch actions where allowed.

**CASHIER**
- POS selling.
- Cash session open/close according to policy.
- Receipts.
- Allowed POS returns/refunds within configured limits.

**WAREHOUSE_OPERATOR**
- Receiving.
- Stock movements allowed by workflow.
- Batch/expiry operations.
- Barcode/catalog inventory operations where granted.

**FINANCE**
- Expenses.
- Cash reconciliation.
- Financial reports.
- Refund/payment records within policy.

### Security rule
Roles are bundles of permissions; authorization remains server-side. No role may bypass audit, inventory movement, financial controls or immutable historical records.

---

## 10. Legal/accounting baseline

### Decision
The product is an **operational commerce system, not a certified replacement for professional accounting/legal advice**.

Before production, the merchant must validate the exact statutory setup with the accountant/legal adviser, including:

- tax regime and VAT status;
- required invoice/document fields;
- applicable cash-register/software requirements;
- document retention/archiving requirements;
- e-commerce disclosures/terms/return rules;
- business identification information (RC, NIF and other applicable identifiers);
- applicable personal-data/privacy obligations.

### Software requirements derived from this decision

The system must support:

- immutable historical commercial documents;
- auditability of financial/stock changes;
- controlled numbering;
- document generation with configurable merchant legal information;
- data retention/export and backup;
- separation between operational reporting and statutory accounting.

Algerian official sources confirm that e-commerce offers must present required merchant information and delivery/return/payment terms, and that sales through electronic communications give rise to an invoice. The 2026 Finance Law also introduced/strengthened integrity, security, conservation and archiving requirements for certain cash-register/software cases. Exact applicability to Plazza must be confirmed from its tax regime and operating model before production. 

---

## 11. Closed vs externally validated

The following are now **closed project decisions**:

- COD reservation timing.
- COGS method.
- Return window and operational refund workflow.
- Exchange price-difference handling.
- Failed-delivery cost treatment.
- Identifier/numbering policy.
- ZR adapter strategy.
- Minimum catalog attribute set.
- Initial staff roles.

The following are **external facts that the implementation agent must verify rather than invent**:

- Current merchant-specific ZR credentials and exact API/webhook contract.
- Final merchant legal/tax/accounting status and any required certified/secured cash-register configuration.
- Final published store terms and product-specific return exceptions.

These validation items do not reopen architecture; they fill merchant-specific facts required for production activation.

---

## 12. Implementation rule

When implementation reaches a closed decision above, the coding agent must treat it as authoritative.

When implementation encounters one of the external-validation items, it must stop at the integration/configuration boundary, record the missing evidence, and request the required merchant/official documentation rather than inventing a value.
