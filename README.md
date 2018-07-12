# 👨🏼‍💻emma-replicator👬

npm to Elasticsearch replication tool.

---

This is a failure resilient npm registry to Elasticsearch index replication process.
It will replicate all npm packages to an Elasticsearch index and keep it up to date.

The replication should always be running.
If the process fails, restart but input correct values in to the config.
