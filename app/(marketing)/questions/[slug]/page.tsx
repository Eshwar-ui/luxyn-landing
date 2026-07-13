import { notFound } from "next/navigation";
import TopicPage from "../../../_components/TopicPage";
import { questionPages, topicMetadata } from "../../../_lib/content";

export const dynamic = "force-static";

export function generateStaticParams() {
  return questionPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = questionPages.find((item) => item.slug === slug);
  return page ? topicMetadata(page, "questions") : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = questionPages.find((item) => item.slug === slug);
  if (!page) notFound();
  return <TopicPage page={page} section="questions" />;
}
