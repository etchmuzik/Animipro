// ─── AnimaPro — Tickets module (top-level) ──────────────────────────────────
//
// Routes the four sub-views (Sell · Scan · Sales · Clubs) based on the
// user's role. Door scanners ONLY see Scan; animation staff see Sell + Scan;
// managers also see Sales + Clubs.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { ScanLine, Ticket as TicketIcon, BarChart3, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPermissions, type AppUser } from '@/lib/roles'
import { SellPanel } from './tickets/sell-panel'
import { ScanPanel } from './tickets/scan-panel'
import { SalesPanel } from './tickets/sales-panel'
import { ClubsPanel } from './tickets/clubs-panel'

type Tab = 'sell' | 'scan' | 'sales' | 'clubs'

interface TabDef {
  id: Tab
  label: string
  icon: React.ElementType
  visible: boolean
}

export function TicketsModule({ currentUser }: { currentUser: AppUser }): React.ReactElement {
  const perms = useMemo(() => getPermissions(currentUser.role), [currentUser.role])

  const tabs = useMemo<TabDef[]>(() => [
    { id: 'sell',  label: 'Sell',          icon: TicketIcon, visible: perms.canSellTickets },
    { id: 'scan',  label: 'Scan',          icon: ScanLine,   visible: perms.canScanTickets },
    { id: 'sales', label: 'Sales report',  icon: BarChart3,  visible: perms.canViewSalesReport },
    { id: 'clubs', label: 'Clubs',         icon: Building2,  visible: perms.canSellTickets || perms.canManageClubs },
  ], [perms.canSellTickets, perms.canScanTickets, perms.canViewSalesReport, perms.canManageClubs])

  const visibleTabs = tabs.filter(t => t.visible)
  const defaultTab: Tab = visibleTabs[0]?.id ?? 'sell'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  // If the user role changes (demo picker swap) ensure the active tab is still
  // visible — drop to the first allowed one if not.
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'sell')
    }
  }, [visibleTabs, activeTab])

  // Auto-jump to Scan tab if the URL has ?scan=… (deep link from a QR).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasScanParam = new URLSearchParams(window.location.search).has('scan')
    if (hasScanParam && perms.canScanTickets) setActiveTab('scan')
  }, [perms.canScanTickets])

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div role="tablist" aria-label="Tickets sections" className="inline-flex p-1 rounded-lg bg-muted gap-1">
        {visibleTabs.map(t => {
          const isActive = t.id === activeTab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-13 font-semibold transition-colors',
                isActive
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div className="anim-fade-in-up" key={activeTab}>
        {activeTab === 'sell'  && perms.canSellTickets     && <SellPanel  currentUser={currentUser} />}
        {activeTab === 'scan'  && perms.canScanTickets     && <ScanPanel  currentUser={currentUser} />}
        {activeTab === 'sales' && perms.canViewSalesReport && <SalesPanel currentUser={currentUser} />}
        {activeTab === 'clubs' && (perms.canSellTickets || perms.canManageClubs) && <ClubsPanel />}
      </div>
    </div>
  )
}
