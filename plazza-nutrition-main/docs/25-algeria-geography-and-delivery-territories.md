# Algeria Geography & Delivery Territories

## Purpose
Define how the system models Algerian administrative geography separately from courier coverage and pricing.

## Current planning assumption
The current legal territorial model provides for **69 wilayas and 1541 communes**. The 2026 transition should be treated as a data/governance concern, not hard-coded business logic. The implementation must be able to represent the new administrative model while preserving historical transactions and provider-specific mappings.

Primary legal reference: **Journal Officiel de la République Algérienne n°25, 5 April 2026, Law 26-06**, plus subsequent official publications relevant to the transition.

## Design rule
The application must distinguish:

1. **Administrative geography** — wilaya, commune and related address data.
2. **Courier coverage** — whether a provider serves a destination and by which service modes.
3. **Shipping price/cost** — what the customer pays and what the merchant pays the courier.

These are related but not interchangeable.

## Data model direction
Keep explicit administrative entities such as:

```text
wilayas
communes
```

An address should reference the applicable administrative identifiers where known rather than storing only free-form text. The order/shipment must also keep a historical destination snapshot so later geography changes cannot rewrite historical transactions.

Courier-specific tables such as `provider_coverage` / `delivery_zones` should map provider service areas to administrative geography or provider-defined territory identifiers as appropriate. A courier's coverage model must remain provider-specific.

## 58↔69 transition and alias strategy

The system must not model the transition as simply `58 old records + 11 new records`. The authoritative administrative dataset must be imported as a coherent version from an official/current source.

During the transition period, introduce an explicit mapping layer:

```text
administrative_geography_version
        |
        +--> current wilaya/commune records
        |
        +--> aliases / legacy references
                  |
                  +--> historical provider or customer references
```

Rules:

- Internal geography IDs are stable and never reused.
- Each geography dataset is versioned with source, import date and effective date where known.
- Legacy 58-wilaya identifiers/names remain representable as aliases or historical references; they are not treated as the canonical current model.
- A provider mapping may continue to use legacy territory identifiers during a provider's own transition period without changing the core administrative model.
- Checkout uses the currently active canonical geography version for new orders.
- Historical orders/shipments retain the exact destination snapshot and the geography version used at transaction time.
- Admin UI must make the effective/current model clear instead of silently changing old addresses.

## Checkout implications
The storefront should use structured destination selection where practical:

```text
Wilaya
  -> Commune
  -> Delivery method (HOME / STOP_DESK when supported)
  -> Available courier/rate
```

The exact list of available couriers and methods must come from provider coverage/rate configuration, not from the administrative hierarchy alone.

## Data sourcing
The production geography seed should be based on an authoritative Algerian administrative dataset/version. The project must record the exact source, source version (when available), import date and any transformation/mapping rules in `research/` documentation.

A third-party convenience dataset may be used as an import aid only after validation against the authoritative source; it must not become the undocumented legal source of truth.

Courier coverage must be sourced independently from the selected courier provider(s).
