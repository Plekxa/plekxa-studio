import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DownloadRouteProps = {
  params: Promise<{
    contractId: string;
  }>;
};

type ContractContent = {
  introduction?: string;
  scope?: string;
  deliverables?: unknown[];
  paymentTerms?: string;
  intellectualProperty?: string;
  confidentiality?: string;
  termination?: string;
};

type DownloadMilestone = {
  title: string;
  description: string | null;
  amount: number | string;
  due_date: string | null;
  position: number;
};

type DownloadSignature = {
  party: "creator" | "client";
  signature_name: string;
  signed_at: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return "To be confirmed";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "To be confirmed";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function GET(
  _request: Request,
  { params }: DownloadRouteProps
) {
  try {
    const { contractId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: contract, error } = await supabase
      .from("contracts")
      .select(`
        id,
        creator_id,
        project_title,
        contract_number,
        status,
        currency,
        total_amount,
        start_date,
        end_date,
        content,
        contract_signatures (
          party,
          signature_name,
          signed_at
        ),
        contract_milestones (
          title,
          description,
          amount,
          due_date,
          position
        )
      `)
      .eq("id", contractId)
      .eq("creator_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Contract download query error:", error);

      return new Response("Could not load contract", {
        status: 500,
      });
    }

    if (!contract) {
      return new Response("Contract not found", {
        status: 404,
      });
    }

    const content: ContractContent =
      contract.content &&
      typeof contract.content === "object" &&
      !Array.isArray(contract.content)
        ? (contract.content as ContractContent)
        : {};

    const deliverables: string[] = Array.isArray(
      content.deliverables
    )
      ? content.deliverables.filter(
          (deliverable): deliverable is string =>
            typeof deliverable === "string"
        )
      : [];

    const milestones: DownloadMilestone[] = Array.isArray(
      contract.contract_milestones
    )
      ? (
          contract.contract_milestones as DownloadMilestone[]
        )
          .slice()
          .sort((a, b) => a.position - b.position)
      : [];

    const signatures: DownloadSignature[] = Array.isArray(
      contract.contract_signatures
    )
      ? (contract.contract_signatures as DownloadSignature[])
      : [];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>${escapeHtml(contract.contract_number)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      max-width: 850px;
      margin: 0 auto;
      padding: 48px;
      color: #201c23;
      font-family: Arial, sans-serif;
      line-height: 1.65;
    }

    h1 {
      margin: 0 0 4px;
      font-size: 38px;
      line-height: 1.15;
    }

    h2 {
      margin-top: 34px;
      border-top: 1px solid #ddd;
      padding-top: 24px;
      font-size: 20px;
    }

    p {
      margin: 8px 0;
    }

    ul {
      padding-left: 22px;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 30px 0;
    }

    .meta div {
      border-radius: 10px;
      background: #f7f4f6;
      padding: 14px;
    }

    .meta span,
    .meta strong {
      display: block;
    }

    .meta span {
      color: #777;
      font-size: 11px;
    }

    .milestone,
    .signature {
      margin-bottom: 12px;
      border-radius: 10px;
      background: #f7f4f6;
      padding: 14px;
    }

    .print {
      position: fixed;
      top: 20px;
      right: 20px;
      border: 0;
      border-radius: 8px;
      background: #df536f;
      padding: 11px 16px;
      color: white;
      cursor: pointer;
      font-weight: bold;
    }

    .empty {
      color: #777;
      font-style: italic;
    }

    @media print {
      .print {
        display: none;
      }

      body {
        padding: 0;
      }
    }

    @media (max-width: 700px) {
      body {
        padding: 24px;
      }

      .meta {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body>
  <button class="print" onclick="window.print()">
    Print / Save PDF
  </button>

  <p>Plekxa Creator Services Agreement</p>

  <h1>${escapeHtml(contract.project_title)}</h1>

  <p>${escapeHtml(contract.contract_number)}</p>

  <div class="meta">
    <div>
      <span>Contract value</span>
      <strong>
        ${escapeHtml(
          formatMoney(
            Number(contract.total_amount),
            contract.currency
          )
        )}
      </strong>
    </div>

    <div>
      <span>Start date</span>
      <strong>
        ${escapeHtml(formatDate(contract.start_date))}
      </strong>
    </div>

    <div>
      <span>End date</span>
      <strong>
        ${escapeHtml(formatDate(contract.end_date))}
      </strong>
    </div>
  </div>

  <h2>Agreement</h2>
  <p>${escapeHtml(content.introduction)}</p>

  <h2>Scope of services</h2>
  <p>${escapeHtml(content.scope)}</p>

  <h2>Deliverables</h2>
  ${
    deliverables.length > 0
      ? `
        <ul>
          ${deliverables
            .map(
              (deliverable) =>
                `<li>${escapeHtml(deliverable)}</li>`
            )
            .join("")}
        </ul>
      `
      : `<p class="empty">No deliverables listed.</p>`
  }

  <h2>Payment milestones</h2>
  ${
    milestones.length > 0
      ? milestones
          .map(
            (milestone) => `
              <div class="milestone">
                <strong>
                  ${escapeHtml(milestone.title)}
                </strong>

                <p>
                  ${escapeHtml(milestone.description)}
                </p>

                <p>
                  ${escapeHtml(
                    formatMoney(
                      Number(milestone.amount),
                      contract.currency
                    )
                  )}
                  · ${escapeHtml(
                    formatDate(milestone.due_date)
                  )}
                </p>
              </div>
            `
          )
          .join("")
      : `<p class="empty">No milestones listed.</p>`
  }

  <h2>Payment terms</h2>
  <p>${escapeHtml(content.paymentTerms)}</p>

  <h2>Intellectual property</h2>
  <p>${escapeHtml(content.intellectualProperty)}</p>

  <h2>Confidentiality</h2>
  <p>${escapeHtml(content.confidentiality)}</p>

  <h2>Termination</h2>
  <p>${escapeHtml(content.termination)}</p>

  <h2>Signatures</h2>
  ${
    signatures.length > 0
      ? signatures
          .map(
            (signature) => `
              <div class="signature">
                <strong>
                  ${escapeHtml(
                    signature.party === "creator"
                      ? "Creator"
                      : "Plekxa"
                  )}
                </strong>

                <p>
                  ${escapeHtml(signature.signature_name)}
                </p>

                <p>
                  ${escapeHtml(
                    formatDate(signature.signed_at)
                  )}
                </p>
              </div>
            `
          )
          .join("")
      : `<p class="empty">No signatures recorded.</p>`
  }
</body>
</html>
    `;

    const safeFilename = contract.contract_number.replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    );

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${safeFilename}.html"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Contract download error:", error);

    return new Response("Could not generate contract document", {
      status: 500,
    });
  }
}