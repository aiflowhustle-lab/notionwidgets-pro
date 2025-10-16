'use client';

import { useParams } from 'next/navigation';
import PhoneMockup from '@/components/PhoneMockup';

export default function PhonePreviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gray-100">
      <PhoneMockup widgetSlug={slug} />
    </div>
  );
}
