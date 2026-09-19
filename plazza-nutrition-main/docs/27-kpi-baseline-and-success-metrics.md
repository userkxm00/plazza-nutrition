# KPI Baseline & Success Metrics

## Purpose
Define the first measurable success indicators before implementation and ensure the system can capture a baseline from the first operational release.

## Principles

KPIs are operational measurements, not decorative dashboard numbers. Each KPI must have a clear definition, source data, calculation window and owner of interpretation.

Do not introduce unsupported industry benchmarks as project facts. The initial baseline should come from Plazza's own observed operations.

## Initial KPI set

### Order confirmation time
Time from order creation to confirmed/cancelled decision.

Suggested reporting:
- median;
- p90;
- by order channel/source where available.

### Delivery success rate
Share of dispatched orders that reach a successful delivered state within the defined reporting window.

The exact denominator and treatment of repeated attempts/returned shipments must be documented with the delivery workflow.

### Return / refusal rate
Track customer returns and delivery refusals separately where operationally meaningful.

Do not combine them into one metric unless the business later defines a common reason model.

### Average order value (AOV)
Average completed order value for a clearly defined period and channel.

### Orders per day / period
Number of created, confirmed and completed orders by period so operational volume can be compared over time.

### Stockout / unavailable-item rate
Measure orders or line items affected by unavailable stock, using a documented definition that distinguishes genuine stockout from catalog/configuration errors.

## Baseline timing

The first baseline should be captured during the first controlled operational release. During Phase 1, the system must record the raw facts needed to calculate the agreed KPIs even if the initial dashboard is intentionally simple.

Phase 6 should review trends and operational reliability rather than introducing the KPI definitions for the first time.

## Data quality

Historical imported data may be incomplete. Baseline reports must distinguish:

- measured values from the new system;
- manually supplied historical estimates;
- unavailable / unknown values.

Never present an estimate as an observed system KPI.

## Future expansion

Additional metrics such as margin by product, courier performance, cancellation reasons, and customer repeat rate can be added when the underlying transactional data and business definitions are mature enough to support them.
