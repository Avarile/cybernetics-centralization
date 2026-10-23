import { BlogIndex, blogIndexMetadata } from "@/components/pages/blog-index";

export const metadata = blogIndexMetadata("zh");

export default function BlogPage() {
  return <BlogIndex locale="zh" />;
}
