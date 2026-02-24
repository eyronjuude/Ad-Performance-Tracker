# Proposal: Google BigQuery for Ad Performance Data

| Field | Value |
|-------|-------|
| **Service** | Google BigQuery |
| **Vendor** | Google Cloud |
| **Purpose** | Query ad performance and analytics data at scale |
| **Pricing** | Pay per query (on-demand) or flat-rate (slots). Free tier: 1 TB query/month. |
| **Data** | Queries run in your GCP project; data stays in your BigQuery datasets. |
| **Security** | Use Application Default Credentials or service account key via `GOOGLE_APPLICATION_CREDENTIALS`. No secrets in code. |
| **Reputation** | Industry-standard data warehouse; widely used and documented. |
| **Docs** | [BigQuery Python client](https://cloud.google.com/python/docs/reference/bigquery/latest), [SQL reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax). |
| **Alternatives** | Snowflake, Redshift, Athena — BigQuery chosen for GCP integration and SQL interface. |

## Scope

- **Sample**: Read-only endpoint that returns 5 sample rows from a configurable BigQuery table (project, dataset, table set via environment variables).
- **Performance**: Filtered and deduplicated ad performance: P1 + employee acronym filter; merge identical `ad_name` (sum spend, spend-weighted average cROAS).

## Expected table schema (performance endpoint)

The performance endpoint expects the BigQuery table to include at least these columns:

| Column | Type | Description |
|--------|------|-------------|
| `ad_name` | STRING | Ad or campaign name (used for deduplication) |
| `spend` | NUMERIC/FLOAT | Spend amount (summed when merging duplicates) |
| `croas` | NUMERIC/FLOAT | Conversion ROAS (blended as spend-weighted average when merging) |
| `priority` | STRING | Priority tier (e.g. `P1`); filtered to P1 only |
| `employee_acronym` | STRING | Owner acronym; filtered by query param |
