import SeoSectionPage from "../../_components/SeoSectionPage";
import ContactPanel from "../../_components/ContactPanel";
import { seoPages, sectionMetadata } from "../../_lib/content";

// Dedicated, indexable "lease a suite" page — own metadata + H1, self-canonical,
// with the enquiry form (lease intent pre-selected) so leads convert on the spot.
export const metadata = sectionMetadata("lease-a-suite");

const page = seoPages.find((p) => p.slug === "lease-a-suite")!;

export default function Page() {
  return (
    <SeoSectionPage page={page}>
      <ContactPanel initialVariant="lease" />
    </SeoSectionPage>
  );
}
