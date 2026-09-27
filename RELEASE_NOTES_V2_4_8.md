# Creator Studio v2.4.8

- Fix contract signing by verifying the authenticated creator then writing the signature/status through the server admin client.
- Keep signature writes idempotent using the existing `(contract_id, party)` unique constraint.
- Preserve audit events and staff notifications without allowing notification failures to invalidate a valid signature.
- Display a contract with no end date as **Perpetual** on the contract detail, contract list, and downloaded contract.
- API now returns concrete signing errors instead of masking them behind a generic message.
