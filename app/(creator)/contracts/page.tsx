import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ContractRow = {
  id: string;
  contract_number: string;
  contract_title: string;
  fee_amount: number | string;
  currency: string;
  royalty_percentage: number | string;
  revenue_basis: string;
  status: string;
  signed_at: string | null;
  effective_from: string | null;
  effective_until: string | null;
  contract_storage_path: string | null;
  creator_assets:
    | {
        title: string;
        asset_type: string;
      }
    | {
        title: string;
        asset_type: string;
      }[]
    | null;
};

function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function assetTitle(contract: ContractRow) {
  if (!contract.creator_assets) return "—";

  return Array.isArray(contract.creator_assets)
    ? contract.creator_assets[0]?.title ?? "—"
    : contract.creator_assets.title;
}

export default async function ContractsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contracts, error } = await supabase
    .from("asset_contracts")
    .select(`
      id,
      contract_number,
      contract_title,
      fee_amount,
      currency,
      royalty_percentage,
      revenue_basis,
      status,
      signed_at,
      effective_from,
      effective_until,
      contract_storage_path,
      creator_assets (
        title,
        asset_type
      )
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="studio-page">
      <section className="studio-page-heading">
        <span>Rights and agreements</span>
        <h1>Contracts</h1>
        <p>
          Review the agreements linked to your approved assets,
          fees and revenue participation.
        </p>
      </section>

      {error ? (
        <p className="studio-settings-message">
          {error.message}
        </p>
      ) : null}

      {!contracts?.length ? (
        <section className="studio-panel">
          <div className="studio-empty-state">
            <h3>No contracts yet</h3>
            <p>
              Contracts will appear after Plekxa issues an
              agreement for one of your projects or assets.
            </p>
          </div>
        </section>
      ) : (
        <section className="studio-contract-grid">
          {(contracts as ContractRow[]).map((contract) => (
            <article
              className="studio-panel studio-contract-card"
              key={contract.id}
            >
              <div className="studio-contract-header">
                <div>
                  <span>{contract.contract_number}</span>
                  <h2>{contract.contract_title}</h2>
                </div>

                <span
                  className={`studio-ledger-status is-${contract.status}`}
                >
                  {contract.status}
                </span>
              </div>

              <dl>
                <div>
                  <dt>Asset</dt>
                  <dd>{assetTitle(contract)}</dd>
                </div>

                <div>
                  <dt>Project fee</dt>
                  <dd>
                    {money(
                      contract.fee_amount,
                      contract.currency
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Royalty share</dt>
                  <dd>
                    {Number(contract.royalty_percentage)}%
                  </dd>
                </div>

                <div>
                  <dt>Revenue basis</dt>
                  <dd>
                    {contract.revenue_basis.replaceAll(
                      "_",
                      " "
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Signed</dt>
                  <dd>
                    {contract.signed_at
                      ? new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                        }).format(
                          new Date(contract.signed_at)
                        )
                      : "Not signed"}
                  </dd>
                </div>
              </dl>

              {contract.contract_storage_path ? (
                <a
                  href={`/api/contracts/${contract.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="studio-contract-download"
                >
                  View contract PDF
                </a>
              ) : (
                <span className="studio-contract-unavailable">
                  Document not uploaded
                </span>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}