import type { Metadata } from 'next';

import { PrivacyStatement } from '@/components/privacy-statement';

export const metadata: Metadata = {
  title: 'Privacy | Anna | Anamata',
  description:
    'How the ANNA site and its demo and contact form handle your personal data.',
};

export default function PrivacyPage() {
  return <PrivacyStatement />;
}
