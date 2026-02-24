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

Initial integration: a single read-only API endpoint that returns 5 sample rows from a configurable BigQuery table (project, dataset, table set via environment variables).
