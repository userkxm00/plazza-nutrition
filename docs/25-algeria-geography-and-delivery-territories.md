# Algeria Geography & Delivery Territories

## Purpose
Define how the system models Algerian administrative geography separately from courier coverage and pricing.

## Current planning assumption
As of 2026, the official territorial reorganization provides for 69 wilayas and 1541 communes. The 2026 legal transition should be treated as a data/governance concern, not hard-coded business logic. The official Journal Officiel publishes the territorial changes and related administrative organization. See Journal Officiel n°25 of 5 April 2026 and subsequent official publications. citeturn897778search12turn897778search0

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

## Transition handling
Because the national administrative model may change during an implementation/transition period:

- do not hard-code a permanent assumption of 58 wilayas;
- keep stable internal identifiers for geography records;
- store effective dates/version metadata for administrative datasets where necessary;
- preserve historical order/shipment addresses as snapshots;
- allow delivery-provider mappings to be updated independently of the administrative dataset.

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
The production geography seed should be based on an authoritative Algerian administrative dataset/version. The project should record the source and import date in the data/research documentation. Courier coverage must be sourced independently from the selected courier provider(s).
