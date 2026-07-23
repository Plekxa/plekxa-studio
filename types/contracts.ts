export type ContractStatus =
  | "draft"
  | "sent"
  | "creator_signed"
  | "client_signed"
  | "active"
  | "completed"
  | "cancelled";

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "paid"
  | "cancelled";

export type ContractContent = {
  introduction?: string;
  scope?: string;
  deliverables?: string[];
  paymentTerms?: string;
  intellectualProperty?: string;
  confidentiality?: string;
  termination?: string;
  additionalTerms?: string;
};

export type ContractMilestone = {
  id: string;
  contract_id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  status: MilestoneStatus;
  position: number;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContractSignature = {
  id: string;
  contract_id: string;
  signer_id: string | null;
  party: "creator" | "client";
  signature_name: string;
  signed_at: string;
};

export type CreatorContract = {
  id: string;
  application_id: string | null;
  template_id: string | null;
  project_id: string;
  creator_id: string;
  project_title: string;
  contract_number: string;
  status: ContractStatus;
  currency: string;
  total_amount: number;
  start_date: string | null;
  end_date: string | null;
  content: ContractContent;
  sent_at: string | null;
  creator_signed_at: string | null;
  client_signed_at: string | null;
  activated_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  contract_milestones?: ContractMilestone[];
  contract_signatures?: ContractSignature[];
  contract_events?: ContractEvent[];
};

export type ContractEventType =
  | "created"
  | "sent"
  | "creator_signed"
  | "client_signed"
  | "activated"
  | "completed"
  | "cancelled";

export type ContractEvent = {
  id: string;
  contract_id: string;
  actor_id: string | null;
  event_type: ContractEventType;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};