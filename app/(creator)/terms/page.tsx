import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { LegalDocument } from "@/components/LegalDocument";

export default async function TermsPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "legal",
    "terms.docx"
  );

  const file = await fs.readFile(filePath);

  const { value } = await mammoth.convertToHtml({
    buffer: file,
  });

  return (
    <LegalDocument
      title="Terms of Use"
      html={value}
    />
  );
}