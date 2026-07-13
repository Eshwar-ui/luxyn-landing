import { notFound } from "next/navigation";
import TopicPage from "../../../_components/TopicPage";
import { servicePages, topicMetadata } from "../../../_lib/content";

export const dynamic = "force-static";

export function generateStaticParams() {
  return servicePages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePages.find((item) => item.slug === slug);
  return page ? topicMetadata(page, "services") : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePages.find((item) => item.slug === slug);
  if (!page) notFound();
  return <TopicPage page={page} section="services" />;
}
