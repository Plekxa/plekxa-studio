# Creator Studio v2.4.11

- Fixes Active Projects crash caused by legacy workspaces with a null contract_id being sent to a PostgreSQL UUID filter.
- Preserves v2.4.10 contract signature hash/consent fixes and perpetual contract display.
- Workspaces remain visible according to their workspace status; milestone loading now safely skips unattached contracts.
