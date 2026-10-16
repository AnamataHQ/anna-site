import type { Metadata } from 'next';

import { PrivacyStatement } from '@/components/privacy-statement';

export const metadata: Metadata = {
  title: 'Privacy | Anna | Anamata',
  description: 'How anamata.ai and the ANNA site handle your personal data.',
};

export default function PrivacyPage() {
  return <PrivacyStatement />;
}
