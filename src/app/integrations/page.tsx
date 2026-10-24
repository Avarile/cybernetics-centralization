import { IntegrationsHome, integrationsHomeMetadata } from "@/components/pages/integrations";

export const metadata = integrationsHomeMetadata("en");

export default function IntegrationsHomePage() {
  return <IntegrationsHome locale="en" />;
}
