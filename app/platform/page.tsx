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
import { SettingsModule } from '@/components/modules/settings'
import { COMPANIES, ALL_HOTELS } from '@/lib/mock-data'
import { DEMO_USERS, canAccess, getAllowedSections, type AppUser, type Section } from '@/lib/roles'

const DEFAULT_USER: AppUser = DEMO_USERS.find(u => u.role === 'ANIMATION_CHIEF') ?? DEMO_USERS[0]

export default function AnimaProApp() {
  const [currentUser,       setCurrentUser]      = useState<AppUser>(DEFAULT_USER)
  const [searchQuery,       setSearchQuery]       = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState(DEFAULT_USER.companyId)
  const [selectedHotelId,   setSelectedHotelId]   = useState(DEFAULT_USER.hotelId)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const allowedSections = getAllowedSections(currentUser.role)
  const [activeSection, setActiveSection]         = useState<Section>(allowedSections[0] ?? 'dashboard')

  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) ?? COMPANIES[0]
  const selectedHotel   = ALL_HOTELS.find(h => h.id === selectedHotelId)  ?? selectedCompany.hotels[0]

  function handleUserChange(user: AppUser) {
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
      return <DashboardModule hotelId={selectedHotelId} />
    }
    switch (activeSection) {
      case 'dashboard':     return <DashboardModule      hotelId={selectedHotelId} />
      case 'team':          return <TeamModule            hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'schedule':      return <ScheduleModule        hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'activities':    return <ActivitiesModule                                searchQuery={searchQuery} />
      case 'assignments':   return <AssignmentsModule     hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'events':        return <EventsModule          hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'announcements': return <AnnouncementsModule   hotelId={selectedHotelId} searchQuery={searchQuery} />
      case 'leave':         return <LeaveModule           hotelId={selectedHotelId} currentUser={currentUser} searchQuery={searchQuery} />
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

      {/* ── Demo banner ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between demo-banner text-white text-xs font-semibold px-3 sm:px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0e7490] animate-pulse-dot shrink-0" />
          <span className="truncate text-white/80">Live Demo — AnimaPro Platform</span>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors shrink-0 ml-2">
          <ArrowLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Back to website</span>
          <span className="sm:hidden">Home</span>
        </Link>
      </div>

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
            hotelName={selectedHotel.name}
            companyName={selectedCompany.name}
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onMenuOpen={() => setMobileSidebarOpen(true)}
            onSectionChange={handleSectionChange}
          />

          {/* Scrollable content — add pb-16 on mobile to clear the bottom nav */}
          <main className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-5 pb-20 md:pb-5 bg-zinc-950/40">
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
