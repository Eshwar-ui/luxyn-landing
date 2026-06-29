import SeoSectionPage from "../../_components/SeoSectionPage";
import ContactPanel from "../../_components/ContactPanel";
import { seoPages, sectionMetadata } from "../../_lib/content";

// Dedicated, indexable "book a tour" page — own metadata + H1, self-canonical,
// with the enquiry form (tour intent pre-selected) so leads convert on the spot.
export const metadata = sectionMetadata("book-a-tour");

const page = seoPages.find((p) => p.slug === "book-a-tour")!;

export default function Page() {
  return (
    <SeoSectionPage page={page}>
      <ContactPanel initialVariant="tour" />
    </SeoSectionPage>
  );
}
