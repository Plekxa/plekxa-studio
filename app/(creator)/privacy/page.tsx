import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { LegalDocument } from "@/components/LegalDocument";

export default async function PrivacyPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "legal",
    "privacy.docx"
  );

  const file = await fs.readFile(filePath);

  const { value } = await mammoth.convertToHtml({
    buffer: file,
  });

  return (
    <LegalDocument
      title="Privacy Policy"
      html={value}
    />
  );
}