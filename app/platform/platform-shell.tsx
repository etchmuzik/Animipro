'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { UpcomingBanner } from '@/components/upcoming-banner'
import { DashboardModule } from '@/components/modules/dashboard'
import { TeamModule } from '@/components/modules/team'
import { ScheduleModule } from '@/components/modules/schedule'
import { ActivitiesModule } from '@/components/modules/activities'
import { AssignmentsModule } from '@/components/modules/assignments'
import { EventsModule } from '@/components/modules/events'
import { AnnouncementsModule } from '@/components/modules/announcements'
import { ReportsModule } from '@/components/modules/reports'
import { PerformanceModule } from '@/components/modules/performance'
import { LeaveModule } from '@/components/modules/leave'
import { RecruitmentModule } from '@/components/modules/recruitment'
import { TicketsModule } from '@/components/modules/tickets'
import { SettingsModule } from '@/components/modules/settings'
import { COMPANIES, ALL_HOTELS } from '@/lib/mock-data'
import { canAccess, getAllowedSections, type AppUser, type Section } from '@/lib/roles'

interface PlatformShellProps {
  /** The authenticated user, resolved server-side from Supabase. */
  initialUser: AppUser
  /** True only for SUPER_ADMIN — enables the demo role-switcher for QA. */
  canSwitchUser: boolean
}

export function PlatformShell({ initialUser, canSwitchUser }: PlatformShellProps) {
  const [currentUser,       setCurrentUser]      = useState<AppUser>(initialUser)
  const [searchQuery,       setSearchQuery]       = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialUser.companyId || COMPANIES[0].id)
  const [selectedHotelId,   setSelectedHotelId]   = useState(initialUser.hotelId || ALL_HOTELS[0].id)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const allowedSections = getAllowedSections(currentUser.role)
  const [activeSection, setActiveSection]         = useState<Section>(allowedSections[0] ?? 'dashboard')

  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) ?? COMPANIES[0]
  const selectedHotel   = ALL_HOTELS.find(h => h.id === selectedHotelId)  ?? selectedCompany.hotels[0]

  function handleUserChange(user: AppUser) {
    // Only super-admins may impersonate (QA aid). For everyone else this is a no-op.
    if (!canSwitchUser) return
    setCurrentUser(user)
    setSelectedCompanyId(user.companyId)
    setSelectedHotelId(user.hotelId)
    const sections = getAllowedSections(user.role)
    setActiveSection(sections[0] ?? 'dashboard')
    setSearchQuery('')
  }

  function handleHotelChange(companyId: string, hotelId: string) {
    setSelectedCompanyId(companyId)
    setSelectedHotelId(hotelId)
    setActiveSection('dashboard')
    setSearchQuery('')
  }

  function handleSectionChange(s: Section) {
    if (!canAccess(currentUser.role, s)) return
    setActiveSection(s)
    setSearchQuery('')
  }

  function renderModule() {
    if (!canAccess(currentUser.role, activeSection)) {
      return <DashboardModule hotelId={selectedHotelId} currentUser={currentUser} />
    }
    switch (activeSection) {
      case 'dashboard':     return <DashboardModule      hotelId={selectedHotelId} currentUser={currentUser} />
      case 'team':          return <TeamModule            hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'schedule':      return <ScheduleModule        hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'activities':    return <ActivitiesModule                                searchQuery={searchQuery} />
      case 'assignments':   return <AssignmentsModule     hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'events':        return <EventsModule          hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'announcements': return <AnnouncementsModule   hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'leave':         return <LeaveModule           hotelId={selectedHotelId} currentUser={currentUser} searchQuery={searchQuery} />
      case 'recruitment':   return <RecruitmentModule     currentUser={currentUser} searchQuery={searchQuery} />
      case 'tickets':       return <TicketsModule         currentUser={currentUser} />
      case 'reports':       return <ReportsModule         hotelId={selectedHotelId} />
      case 'performance':   return <PerformanceModule     hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'settings':      return <SettingsModule        hotel={selectedHotel} company={selectedCompany} currentUser={currentUser} />
      default:              return <DashboardModule      hotelId={selectedHotelId} />
    }
  }

  return (
    // h-[100dvh] uses the dynamic viewport height — critical for mobile browsers
    // where the address bar resizes the viewport
    <div className="flex flex-col bg-background overflow-hidden" style={{ height: '100dvh' }}>

      {/* Skip-link — keyboard users (Tab as first action) land here and can
          jump past the banner + sidebar straight to the active module. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* ── Upcoming activity reminder banner ──────────────────────────────── */}
      <UpcomingBanner currentUser={currentUser} hotelId={selectedHotelId} />

      {/* ── App shell ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — desktop visible / mobile drawer */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          selectedCompanyId={selectedCompanyId}
          selectedHotelId={selectedHotelId}
          onHotelChange={handleHotelChange}
          currentUser={currentUser}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main content column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            activeSection={activeSection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hotelId={selectedHotelId}
            hotelName={selectedHotel.name}
            companyName={selectedCompany.name}
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onMenuOpen={() => setMobileSidebarOpen(true)}
            onSectionChange={handleSectionChange}
          />

          {/* Scrollable content — pb-24 + safe-area on phone (60px nav + ~34px notch). */}
          <main
            id="main"
            className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-5 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] md:pb-5 bg-zinc-950/40"
          >
            <div key={activeSection} className="page-enter">
              {renderModule()}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile bottom navigation bar ────────────────────────────────────── */}
      <MobileNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onMenuOpen={() => setMobileSidebarOpen(true)}
        allowedSections={allowedSections}
      />

      {/* ── PWA install prompt ──────────────────────────────────────────────── */}
      <PWAInstallPrompt />
    </div>
  )
}
