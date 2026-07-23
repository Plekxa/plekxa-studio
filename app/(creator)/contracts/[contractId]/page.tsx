import ContractViewerClient from "@/components/contracts/contract-viewer-client";

type ContractPageProps = {
  params: Promise<{
    contractId: string;
  }>;
};

export default async function ContractPage({
  params,
}: ContractPageProps) {
  const { contractId } = await params;

  return <ContractViewerClient contractId={contractId} />;
}