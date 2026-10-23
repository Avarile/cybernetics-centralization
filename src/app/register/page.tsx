import { Register, registerMetadata } from "@/components/pages/register";

export const metadata = registerMetadata("en");

export default function RegisterPage() {
  return <Register locale="en" />;
}
