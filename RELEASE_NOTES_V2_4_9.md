# Creator Studio v2.4.9

- Fix creator contract signing against the production `contract_signatures.signature_hash NOT NULL` constraint.
- Generate a server-side SHA-256 signature hash from contract ID, authenticated signer ID, typed legal name, and signing timestamp.
- Preserve the v2.4.8 Perpetual contract display fix.
- Return Supabase/Postgres `message`, `code`, `details`, and `hint` for signing failures instead of masking plain-object database errors.
