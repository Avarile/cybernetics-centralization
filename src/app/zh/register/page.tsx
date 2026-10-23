import { Register, registerMetadata } from "@/components/pages/register";

export const metadata = registerMetadata("zh");

export default function RegisterPage() {
  return <Register locale="zh" />;
}
