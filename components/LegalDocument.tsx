type LegalDocumentProps = {
  title: string;
  html: string;
};

export function LegalDocument({
  title,
  html,
}: LegalDocumentProps) {
  return (
    <main className="legal-page">
      <div className="container">
        <article className="legal-document">
          <span className="eyebrow">PLEKXA LEGAL</span>
          <h1>{title}</h1>

          <div
            className="legal-document-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </main>
  );
}