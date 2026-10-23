import { BlogIndex, blogIndexMetadata } from "@/components/pages/blog-index";

export const metadata = blogIndexMetadata("en");

export default function BlogPage() {
  return <BlogIndex locale="en" />;
}
