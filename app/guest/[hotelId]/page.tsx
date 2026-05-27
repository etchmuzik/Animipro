// ─── AnimaPro — Guest hotel page (per-hotel route) ─────────────────────────────
//
// Server component shell: emits the static-export route + delegates the
// interactive surface to the client GuestShell. `generateStaticParams()` is
// REQUIRED because `next.config.js` sets `output: 'export'` — Next must know
// the full set of hotel ids at build time to pre-render one HTML per hotel
// under out/guest/<hotelId>/index.html. There is no SSR at request time.

import { notFound } from 'next/navigation'
import { ALL_HOTELS } from '@/lib/mock-data'
import { GuestShell } from '@/components/guest/guest-shell'

export function generateStaticParams(): { hotelId: string }[] {
  return ALL_HOTELS.map(h => ({ hotelId: h.id }))
}

interface PageProps {
  params: Promise<{ hotelId: string }>
}

export default async function GuestHotelPage({ params }: PageProps): Promise<React.ReactElement> {
  const { hotelId } = await params
  const hotel = ALL_HOTELS.find(h => h.id === hotelId)
  if (!hotel) notFound()
  return <GuestShell hotelId={hotel.id} hotelName={hotel.name} />
}
