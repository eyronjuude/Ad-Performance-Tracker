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
| `ad_name` | STRING | Ad or campaign name; P1 filter = substring `P1` present (case-insensitive). Used for deduplication. |
| `adset_name` | STRING | Ad set name; employee acronym filter = acronym appears as a word (surrounded by non-letters only). |
| `spend_sum` | NUMERIC/FLOAT | Spend amount (summed when merging duplicates) |
| `placed_order_total_revenue_sum_direct_session` | NUMERIC/FLOAT | Direct-session attributed order revenue (summed when merging). cROAS = revenue / spend_sum; when merged, `SUM(placed_order_total_revenue_sum_direct_session) / SUM(spend_sum)`. |

Filters are derived from these string columns; there are no separate `priority` or `employee_acronym` columns.
