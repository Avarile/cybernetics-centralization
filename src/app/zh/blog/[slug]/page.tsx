import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPost, blogPostMetadata } from "@/components/pages/blog-post";
import { getAllPosts, getPost } from "@/lib/blog";

// Static export: every post is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/zh/blog/[slug]">): Promise<Metadata> {
  return blogPostMetadata((await params).slug, "zh");
}

export default async function PostPage({ params }: PageProps<"/zh/blog/[slug]">) {
  const post = getPost((await params).slug, "zh");
  if (!post) notFound();
  return <BlogPost post={post} locale="zh" />;
}
