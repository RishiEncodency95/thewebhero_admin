'use client';

import { SingletonScreen } from '@/components/cms/SingletonScreen';

/** Phone, email, WhatsApp, address, map and social profiles - used everywhere on the website. */
export default function ContactSettingsPage() {
  return (
    <SingletonScreen
      resource="settings"
      groups={['Contact', 'Notifications']}
      title="Contact & Social"
      description="Phone, email, WhatsApp, address, Google Map and social profiles. Every page of the website uses these, so change them here once."
    />
  );
}
