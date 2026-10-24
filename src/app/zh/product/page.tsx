import { ProductHome, productHomeMetadata } from "@/components/pages/product";

export const metadata = productHomeMetadata("zh");

export default function ProductHomePage() {
  return <ProductHome locale="zh" />;
}
