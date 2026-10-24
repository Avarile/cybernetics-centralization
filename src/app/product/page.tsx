import { ProductHome, productHomeMetadata } from "@/components/pages/product";

export const metadata = productHomeMetadata("en");

export default function ProductHomePage() {
  return <ProductHome locale="en" />;
}
