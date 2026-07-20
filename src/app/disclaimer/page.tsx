import type { Metadata } from "next";
import { LegalDocumentContent } from "@/components/legal/legal-document";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { legalDocuments } from "@/content/legal-documents";

const document = legalDocuments.disclaimer;

export const metadata: Metadata = {
  title: {
    absolute: document.metadata.title,
  },
  description: document.metadata.description,
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout subtitle={document.subtitle} title={document.title}>
      <LegalDocumentContent document={document} />
    </LegalPageLayout>
  );
}
