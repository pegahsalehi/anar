import type { LegalBlock, LegalDocument } from "@/content/legal-documents";

type LegalDocumentContentProps = {
  document: LegalDocument;
};

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  return (
    <article className="rounded-md border border-border bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
      <p className="text-sm font-semibold text-foreground">{document.effectiveDate}</p>

      <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
        {document.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-9 divide-y divide-border">
        {document.sections.map((section) => (
          <section
            aria-labelledby={section.id}
            className="py-8 first:pt-0 last:pb-0"
            key={section.id}
          >
            <h2
              className="text-xl font-semibold leading-tight text-card-foreground"
              id={section.id}
            >
              {section.title}
            </h2>
            <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground">
              {section.blocks.map((block, index) => (
                <LegalBlockRenderer block={block} key={getBlockKey(block, index)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function LegalBlockRenderer({ block }: { block: LegalBlock }) {
  if (block.kind === "subheading") {
    return (
      <h3 className="pt-1 text-base font-semibold leading-7 text-card-foreground" id={block.id}>
        {block.text}
      </h3>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="ml-5 list-disc space-y-2">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p>{block.text}</p>;
}

function getBlockKey(block: LegalBlock, index: number) {
  return block.kind === "subheading" ? block.id : `${block.kind}-${index}`;
}
