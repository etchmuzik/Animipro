// ─── Animipro — Tickets · Clubs catalog tab ─────────────────────────────────
//
// Read-only catalog of the partner clubs and their upcoming nights.
// Hotel admins will eventually be able to edit this; for v1 it's a browse.

'use client'

import { Calendar, Clock, MapPin, ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLUBS, formatEgp, getNightsForClub } from '@/lib/club-tickets'

export function ClubsPanel(): React.ReactElement {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Partner clubs with negotiated allocations. Hotel admins will be able to add/edit clubs and per-night pricing in a future release — for now this is the seeded Sharm catalog.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CLUBS.map(club => {
          const nights = getNightsForClub(club.id)
          return (
            <article key={club.id} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
              <div className={cn('p-4 text-white bg-gradient-to-br', club.gradient)}>
                <p className="text-mini font-bold uppercase tracking-wide opacity-80">{club.area}</p>
                <h3 className="text-lg font-extrabold leading-tight">{club.name}</h3>
                <p className="text-sm opacity-95 mt-1">{club.tagline}</p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-2 text-mini">
                <Stat icon={Users}        label="Capacity" value={club.capacity.toString()} />
                <Stat icon={ShieldCheck}  label="Min age"  value={`${club.minAge}+`} />
                <Stat icon={MapPin}       label="From"     value={formatEgp(club.priceFrom)} />
              </div>
              <div className="px-4 pb-4 mt-auto">
                <p className="text-eyebrow mb-2">Upcoming nights</p>
                {nights.length === 0 ? (
                  <p className="text-mini text-muted-foreground italic">No nights scheduled.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {nights.slice(0, 3).map(n => (
                      <li key={n.id} className="flex items-center gap-2 text-13">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-semibold w-20 shrink-0">
                          {new Date(n.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
                        </span>
                        <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground w-12 shrink-0">{n.doorsOpen}</span>
                        <span className="text-foreground truncate flex-1">{n.theme}</span>
                        <span className="text-primary font-bold shrink-0">{formatEgp(n.pricePerTicket)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-md border border-border bg-background/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground"><Icon className="w-3 h-3" /><span className="text-tiny font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="text-foreground font-bold leading-tight mt-0.5">{value}</p>
    </div>
  )
}
