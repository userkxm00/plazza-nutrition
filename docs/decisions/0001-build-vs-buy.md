# ADR 0001 — Build vs Buy (Odoo / ERPNext / Custom)

## Status
Accepted: custom application remains the planned direction, subject to final merchant validation during discovery.

## Context
Plazza Nutrition needs a customer-facing Arabic/French storefront plus operational workflows specific to an Algerian COD retailer:

- guest checkout and COD-first commerce;
- ZR Express integration with manual fallback;
- shared online/POS inventory;
- optional batch/expiry tracking for supplements;
- returns/exchanges with stock and financial effects;
- cash-register sessions;
- product/variant profitability and delivery-cost-aware reporting;
- mobile-first customer experience;
- granular staff permissions;
- provider-isolated integrations.

General-purpose ERP products such as Odoo and ERPNext can cover substantial back-office functionality, so building custom software must be justified rather than assumed.

## Options considered

### Odoo / ERP-style customization
**Strengths**
- broad ERP coverage;
- mature purchasing, inventory, accounting and administration capabilities;
- less custom back-office functionality to build from scratch.

**Risks / trade-offs**
- storefront/customer UX may require substantial customization;
- ZR/COD-specific flows would still require custom modules/integration work;
- supplement-specific catalog and return/delivery workflows may become shaped by the ERP instead of the business;
- customization, upgrades and module coupling become ongoing engineering concerns;
- product architecture and deployment may be less aligned with the planned lightweight modular-monolith approach.

### ERPNext / similar ERP platform
**Strengths**
- strong business-management coverage;
- open-source customization path;
- inventory, purchasing and accounting concepts already exist.

**Risks / trade-offs**
- same basic question: how much of the customer storefront, Algerian COD flow, delivery integration and POS behavior must be customized;
- customization and upgrade burden remains;
- may be broader than needed for the retailer's actual operational footprint.

### Custom modular monolith
**Strengths**
- exact control over COD checkout and customer UX;
- direct fit for ZR Express/manual fallback;
- shared domain rules across online and POS;
- explicit inventory, return and profitability semantics;
- clean provider boundaries;
- mobile-first bilingual storefront without ERP constraints;
- architecture can stay small because the business is currently one retailer.

**Risks**
- more engineering work;
- we own testing, security, backup/recovery and operational correctness;
- ERP/accounting functionality must not be recreated indiscriminately.

## Decision
Proceed with the custom modular monolith for the operational commerce system, while deliberately **not** attempting to become a full ERP/accounting replacement.

The system should implement only the business capabilities that materially differentiate or support Plazza Nutrition: storefront, COD orders, delivery operations, shared inventory, POS, purchasing/receiving, returns/exchanges, cash operations, operational finance/profitability and staff controls.

Licensed accounting, tax and statutory requirements must be validated separately with the merchant/accounting professional and integrated at the appropriate boundary rather than silently reinvented.

## Consequence
The custom path is approved only with strict scope discipline and staged delivery. If discovery later shows that most requirements are already satisfied by an ERP with acceptable customization and UX, this ADR can be revisited before implementation is locked.

## Revisit triggers
- major expansion to multiple stores/locations;
- requirement for broad accounting/ERP functionality beyond the documented scope;
- materially different staffing/operational model;
- significant increase in complexity that makes maintaining custom back-office logic uneconomic.
