// AnimaPro Mock Data — localStorage-backed persistence

// ─── COMPANY & HOTEL HIERARCHY ────────────────────────────────────────────────

export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
export type HotelCity =
  | 'SHARM_EL_SHEIKH'
  | 'HURGHADA'
  | 'MARSA_ALAM'
  | 'DAHAB'
  | 'EL_GOUNA'
  | 'SAHL_HASHEESH'
  | 'MAKADI_BAY'
  | 'AIN_SOKHNA'
  | 'TABA'
  | 'NUWEIBA'
  | 'ALEXANDRIA'
  | 'LUXOR'
  | 'ASWAN'
  | 'CAIRO'
  | 'SAFAGA'

export const CITY_LABELS: Record<HotelCity, string> = {
  SHARM_EL_SHEIKH: 'Sharm El Sheikh',
  HURGHADA: 'Hurghada',
  MARSA_ALAM: 'Marsa Alam',
  DAHAB: 'Dahab',
  EL_GOUNA: 'El Gouna',
  SAHL_HASHEESH: 'Sahl Hasheesh',
  MAKADI_BAY: 'Makadi Bay',
  AIN_SOKHNA: 'Ain Sokhna',
  TABA: 'Taba',
  NUWEIBA: 'Nuweiba',
  ALEXANDRIA: 'Alexandria',
  LUXOR: 'Luxor',
  ASWAN: 'Aswan',
  CAIRO: 'Cairo',
  SAFAGA: 'Safaga',
}

export const CITY_REGION: Record<HotelCity, string> = {
  SHARM_EL_SHEIKH: 'South Sinai',
  HURGHADA: 'Red Sea',
  MARSA_ALAM: 'Red Sea',
  DAHAB: 'South Sinai',
  EL_GOUNA: 'Red Sea',
  SAHL_HASHEESH: 'Red Sea',
  MAKADI_BAY: 'Red Sea',
  AIN_SOKHNA: 'Suez',
  TABA: 'South Sinai',
  NUWEIBA: 'South Sinai',
  ALEXANDRIA: 'Mediterranean',
  LUXOR: 'Upper Egypt',
  ASWAN: 'Upper Egypt',
  CAIRO: 'Cairo',
  SAFAGA: 'Red Sea',
}

export interface Company {
  id: string
  name: string
  logo?: string
  plan: SubscriptionPlan
  contactEmail: string
  hotels: Hotel[]
}

export interface Hotel {
  id: string
  companyId: string
  name: string
  city: HotelCity
  stars: number
  address: string
  contactEmail: string
  tripAdvisorRating: number      // out of 5.0
  tripAdvisorReviews: number
  tripAdvisorRank: string        // e.g. "#3 of 48 hotels in Hurghada"
  tripAdvisorBadge?: string      // "Travelers' Choice" | "Top Rated" | null
  tripAdvisorTrend: 'up' | 'down' | 'stable'
  googleRating: number
  bookingRating: number          // Booking.com score out of 10
}

export const COMPANIES: Company[] = [
  {
    id: 'co1',
    name: 'Sunrise Hospitality Group',
    plan: 'ENTERPRISE',
    contactEmail: 'ops@sunrisehospitality.com',
    hotels: [
      {
        id: 'h1', companyId: 'co1',
        name: 'Sunrise Palace Resort', city: 'SHARM_EL_SHEIKH', stars: 5,
        address: 'Naama Bay, Sharm El Sheikh, South Sinai', contactEmail: 'palace@sunrisehospitality.com',
        tripAdvisorRating: 4.7, tripAdvisorReviews: 3842, tripAdvisorRank: '#4 of 61 hotels in Sharm El Sheikh',
        tripAdvisorBadge: "Travelers' Choice", tripAdvisorTrend: 'up',
        googleRating: 4.6, bookingRating: 9.1,
      },
      {
        id: 'h2', companyId: 'co1',
        name: 'Sunrise Lagoon Hotel', city: 'HURGHADA', stars: 4,
        address: 'El Mamsha Street, El Dahar, Hurghada, Red Sea', contactEmail: 'lagoon@sunrisehospitality.com',
        tripAdvisorRating: 4.4, tripAdvisorReviews: 2106, tripAdvisorRank: '#12 of 103 hotels in Hurghada',
        tripAdvisorBadge: undefined, tripAdvisorTrend: 'stable',
        googleRating: 4.3, bookingRating: 8.7,
      },
    ],
  },
  {
    id: 'co2',
    name: 'Azure Shores Hotels',
    plan: 'PROFESSIONAL',
    contactEmail: 'info@azureshores.com',
    hotels: [
      {
        id: 'h3', companyId: 'co2',
        name: 'Azure Beach Resort', city: 'HURGHADA', stars: 5,
        address: 'Sahl Hasheesh Bay, Hurghada, Red Sea Governorate', contactEmail: 'beach@azureshores.com',
        tripAdvisorRating: 4.8, tripAdvisorReviews: 5211, tripAdvisorRank: '#2 of 103 hotels in Hurghada',
        tripAdvisorBadge: "Travelers' Choice", tripAdvisorTrend: 'up',
        googleRating: 4.7, bookingRating: 9.4,
      },
      {
        id: 'h4', companyId: 'co2',
        name: 'Azure Coral Club', city: 'MARSA_ALAM', stars: 4,
        address: 'Port Ghalib Marina, Marsa Alam, Red Sea', contactEmail: 'coral@azureshores.com',
        tripAdvisorRating: 4.5, tripAdvisorReviews: 1389, tripAdvisorRank: '#6 of 34 hotels in Marsa Alam',
        tripAdvisorBadge: 'Top Rated', tripAdvisorTrend: 'down',
        googleRating: 4.4, bookingRating: 8.9,
      },
    ],
  },
  {
    id: 'co3',
    name: 'Red Sea Resorts Group',
    plan: 'ENTERPRISE',
    contactEmail: 'info@redsearesortsgroup.com',
    hotels: [
      {
        id: 'h5', companyId: 'co3',
        name: 'Gouna Pearl Resort', city: 'EL_GOUNA', stars: 5,
        address: 'Abu Tig Marina, El Gouna, Red Sea', contactEmail: 'pearl@redsearesortsgroup.com',
        tripAdvisorRating: 4.6, tripAdvisorReviews: 2874, tripAdvisorRank: '#3 of 28 hotels in El Gouna',
        tripAdvisorBadge: "Travelers' Choice", tripAdvisorTrend: 'up',
        googleRating: 4.5, bookingRating: 9.0,
      },
      {
        id: 'h6', companyId: 'co3',
        name: 'Makadi Bay Grand Hotel', city: 'MAKADI_BAY', stars: 5,
        address: 'Makadi Bay, Hurghada, Red Sea Governorate', contactEmail: 'grand@redsearesortsgroup.com',
        tripAdvisorRating: 4.5, tripAdvisorReviews: 1943, tripAdvisorRank: '#2 of 14 hotels in Makadi Bay',
        tripAdvisorBadge: 'Top Rated', tripAdvisorTrend: 'stable',
        googleRating: 4.4, bookingRating: 8.8,
      },
      {
        id: 'h7', companyId: 'co3',
        name: 'Ain Sokhna Marina Resort', city: 'AIN_SOKHNA', stars: 4,
        address: 'Galala Road, Ain Sokhna, Suez', contactEmail: 'marina@redsearesortsgroup.com',
        tripAdvisorRating: 4.3, tripAdvisorReviews: 987, tripAdvisorRank: '#5 of 42 resorts in Ain Sokhna',
        tripAdvisorBadge: undefined, tripAdvisorTrend: 'up',
        googleRating: 4.2, bookingRating: 8.5,
      },
    ],
  },
  {
    id: 'co4',
    name: 'Sinai Heritage Hotels',
    plan: 'PROFESSIONAL',
    contactEmail: 'ops@sinaiheritage.com',
    hotels: [
      {
        id: 'h8', companyId: 'co4',
        name: 'Dahab Blue Lagoon Hotel', city: 'DAHAB', stars: 4,
        address: 'Mashraba Bay, Dahab, South Sinai', contactEmail: 'dahab@sinaiheritage.com',
        tripAdvisorRating: 4.4, tripAdvisorReviews: 1231, tripAdvisorRank: '#2 of 31 hotels in Dahab',
        tripAdvisorBadge: undefined, tripAdvisorTrend: 'up',
        googleRating: 4.3, bookingRating: 8.6,
      },
      {
        id: 'h9', companyId: 'co4',
        name: 'Taba Heights Grand Resort', city: 'TABA', stars: 5,
        address: 'Taba Heights, Gulf of Aqaba, South Sinai', contactEmail: 'taba@sinaiheritage.com',
        tripAdvisorRating: 4.5, tripAdvisorReviews: 1654, tripAdvisorRank: '#1 of 9 hotels in Taba',
        tripAdvisorBadge: "Travelers' Choice", tripAdvisorTrend: 'stable',
        googleRating: 4.4, bookingRating: 8.9,
      },
    ],
  },
]

// Helper: get all hotels flat
export const ALL_HOTELS: Hotel[] = COMPANIES.flatMap(c => c.hotels)
export function getHotelById(hotelId: string): Hotel | undefined {
  return ALL_HOTELS.find(h => h.id === hotelId)
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOTEL_ADMIN'
  | 'ANIMATION_CHIEF'
  | 'TEAM_LEADER'
  | 'ANIMATOR'
  | 'ENTERTAINER'
  | 'LIFEGUARD'
  | 'KIDS_CLUB'
  | 'DOOR_SCANNER'   // Club door staff: validates QR tickets only — no other access.

export type TeamType =
  | 'BEACH_ANIMATION'
  | 'POOL_ANIMATION'
  | 'KIDS_CLUB'
  | 'SPORTS'
  | 'EVENING_SHOW'
  | 'AQUA_GYM'
  | 'ENTERTAINMENT'
  | 'EXCURSIONS'
  | 'GENERAL'

export type ActivityType =
  | 'SPORTS'
  | 'WATER_SPORTS'
  | 'AQUA_GYM'
  | 'KIDS_ACTIVITY'
  | 'EVENING_SHOW'
  | 'DANCE_CLASS'
  | 'GAME'
  | 'EXCURSION'
  | 'CULTURAL'
  | 'FITNESS'
  | 'ENTERTAINMENT'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type AssignmentStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type AnnouncementType = 'GENERAL' | 'URGENT' | 'SCHEDULE_CHANGE' | 'TRAINING' | 'POLICY' | 'EVENT'
export type EventType = 'GALA_DINNER' | 'THEME_NIGHT' | 'KIDS_PARTY' | 'SPORTS_TOURNAMENT' | 'CULTURAL_SHOW' | 'FAREWELL_PARTY' | 'WELCOME_PARTY' | 'SPECIAL_PERFORMANCE'
export type EventStatus = 'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Animator {
  id: string
  hotelId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  teamId: string
  teamName: string
  nationality: string
  languages: string[]
  specialties: string[]
  avatar?: string
  contractType: 'FULL_TIME' | 'PART_TIME' | 'SEASONAL' | 'FREELANCE'
  startDate: string
  isActive: boolean
  performance: number // 0-100
  attendanceRate: number // 0-100
}

export interface Team {
  id: string
  hotelId: string
  name: string
  type: TeamType
  color: string
  memberCount: number
  leaderId: string
  leaderName: string
  description: string
}

export interface Activity {
  id: string
  name: string
  nameAr?: string
  type: ActivityType
  venue: string
  duration: number
  minAnimators: number
  maxGuests?: number
  ageGroup: 'KIDS' | 'TEENS' | 'ADULTS' | 'SENIORS' | 'ALL' | 'FAMILY'
  equipment: string[]
  isActive: boolean
}

export interface ScheduleEntry {
  id: string
  hotelId: string
  animatorId: string
  animatorName: string
  teamId: string
  activityId?: string
  activityName?: string
  venue: string
  date: string
  startTime: string
  endTime: string
  type: 'ACTIVITY' | 'SHIFT' | 'BREAK' | 'MEETING' | 'TRAINING' | 'OFF_DUTY'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED'
  attendance?: AttendanceStatus
}

export interface Assignment {
  id: string
  hotelId: string
  title: string
  description: string
  assignedToId: string
  assignedToName: string
  assignedById: string
  teamId?: string
  activityName?: string
  date: string
  startTime: string
  endTime: string
  priority: Priority
  status: AssignmentStatus
  createdAt: string
}

export interface Announcement {
  id: string
  hotelId: string
  title: string
  content: string
  type: AnnouncementType
  priority: Priority
  targetRoles: UserRole[]
  isActive: boolean
  createdAt: string
  expiresAt?: string
  authorName: string
}

export interface LeaveRequest {
  id: string
  hotelId: string
  animatorId: string
  animatorName: string
  type: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'UNPAID' | 'DAY_OFF'
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  reviewedBy?: string
  createdAt: string
}

export interface EventItem {
  id: string
  hotelId: string
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  venue: string
  type: EventType
  expectedGuests: number
  status: EventStatus
  assignedAnimators: string[]
}

export interface PerformanceScore {
  animatorId: string
  animatorName: string
  period: string
  punctuality: number
  attitude: number
  skills: number
  guestFeedback: number
  teamwork: number
  overall: number
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

export const TEAMS: Team[] = [
  // --- Sunrise Palace Resort (h1) ---
  { id: 't1', hotelId: 'h1', name: 'Beach Squad', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 6, leaderId: 'u2', leaderName: 'Marco Rossi', description: 'Beach and sea activities' },
  { id: 't2', hotelId: 'h1', name: 'Pool Stars', type: 'POOL_ANIMATION', color: '#06b6d4', memberCount: 5, leaderId: 'u5', leaderName: 'Amira Hassan', description: 'Pool games and aqua gym' },
  { id: 't3', hotelId: 'h1', name: 'Kids Club', type: 'KIDS_CLUB', color: '#f97316', memberCount: 4, leaderId: 'u8', leaderName: 'Sophie Laurent', description: 'Mini club and family activities' },
  { id: 't4', hotelId: 'h1', name: 'Evening Show', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 7, leaderId: 'u3', leaderName: 'Ahmed Khalil', description: 'Nightly entertainment shows' },
  { id: 't5', hotelId: 'h1', name: 'Sports Team', type: 'SPORTS', color: '#22c55e', memberCount: 4, leaderId: 'u11', leaderName: 'Carlos Mendez', description: 'Beach volleyball, tennis, football' },
  { id: 't6', hotelId: 'h1', name: 'Aqua Gym', type: 'AQUA_GYM', color: '#14b8a6', memberCount: 3, leaderId: 'u14', leaderName: 'Nadia Petrov', description: 'Water fitness and aerobics' },
  // --- Sunrise Lagoon Hotel (h2) ---
  { id: 't7', hotelId: 'h2', name: 'Lagoon Divers', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 5, leaderId: 'u20', leaderName: 'Rania Saleh', description: 'Diving and snorkeling programs' },
  { id: 't8', hotelId: 'h2', name: 'Aqua Fun', type: 'POOL_ANIMATION', color: '#06b6d4', memberCount: 4, leaderId: 'u22', leaderName: 'Piotr Kowalski', description: 'Pool entertainment and water games' },
  { id: 't9', hotelId: 'h2', name: 'Mini Stars', type: 'KIDS_CLUB', color: '#f97316', memberCount: 3, leaderId: 'u24', leaderName: 'Elena Russo', description: 'Kids activities and junior club' },
  { id: 't10', hotelId: 'h2', name: 'Stage Crew', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 5, leaderId: 'u25', leaderName: 'Tarek Nour', description: 'Evening performances and shows' },
  // --- Azure Beach Resort (h3) ---
  { id: 't11', hotelId: 'h3', name: 'Azure Waves', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 7, leaderId: 'u30', leaderName: 'Sofia Papadaki', description: 'Premium beach experience' },
  { id: 't12', hotelId: 'h3', name: 'Splash Zone', type: 'AQUA_GYM', color: '#14b8a6', memberCount: 4, leaderId: 'u32', leaderName: 'Mikael Lindqvist', description: 'Aqua fitness and water aerobics' },
  { id: 't13', hotelId: 'h3', name: 'Champions', type: 'SPORTS', color: '#22c55e', memberCount: 6, leaderId: 'u33', leaderName: 'Alia Farouk', description: 'Sports tournaments and fitness' },
  // --- Azure Coral Club (h4) ---
  { id: 't14', hotelId: 'h4', name: 'Coral Divers', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 4, leaderId: 'u40', leaderName: 'Bruno Ferreira', description: 'Reef diving and snorkeling' },
  { id: 't15', hotelId: 'h4', name: 'Sunset Show', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 5, leaderId: 'u41', leaderName: 'Yasmin Khalid', description: 'Sunset entertainment shows' },
  { id: 't16', hotelId: 'h4', name: 'Little Corals', type: 'KIDS_CLUB', color: '#f97316', memberCount: 3, leaderId: 'u43', leaderName: 'Anna Becker', description: 'Kids club and junior programs' },
  // --- Gouna Pearl Resort (h5) ---
  { id: 't17', hotelId: 'h5', name: 'Marina Waves', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 5, leaderId: 'u50', leaderName: 'Mina Girgis', description: 'Lagoon & marina water sports' },
  { id: 't18', hotelId: 'h5', name: 'Gouna Stars', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 6, leaderId: 'u51', leaderName: 'Dina Ashraf', description: 'Evening shows and cultural nights' },
  { id: 't19', hotelId: 'h5', name: 'Pearl Kids', type: 'KIDS_CLUB', color: '#f97316', memberCount: 3, leaderId: 'u52', leaderName: 'Sylvia Kern', description: 'Kids activities and mini club' },
  // --- Makadi Bay Grand Hotel (h6) ---
  { id: 't20', hotelId: 'h6', name: 'Makadi Splash', type: 'POOL_ANIMATION', color: '#06b6d4', memberCount: 5, leaderId: 'u55', leaderName: 'Adel Farid', description: 'Pool and beach animation' },
  { id: 't21', hotelId: 'h6', name: 'Bay Sports', type: 'SPORTS', color: '#22c55e', memberCount: 4, leaderId: 'u56', leaderName: 'Sven Olsen', description: 'Sports and fitness programs' },
  // --- Ain Sokhna Marina Resort (h7) ---
  { id: 't22', hotelId: 'h7', name: 'Sokhna Beats', type: 'ENTERTAINMENT', color: '#ec4899', memberCount: 4, leaderId: 'u60', leaderName: 'Nour Essam', description: 'Entertainment and events' },
  { id: 't23', hotelId: 'h7', name: 'Sokhna Aqua', type: 'AQUA_GYM', color: '#14b8a6', memberCount: 3, leaderId: 'u61', leaderName: 'Petra Novak', description: 'Aqua gym and water fitness' },
  // --- Dahab Blue Lagoon Hotel (h8) ---
  { id: 't24', hotelId: 'h8', name: 'Dahab Divers', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 5, leaderId: 'u65', leaderName: 'Ahmed Saber', description: 'Diving and water sports in Dahab' },
  { id: 't25', hotelId: 'h8', name: 'Lagoon Lights', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 4, leaderId: 'u66', leaderName: 'Isabelle Marin', description: 'Evening entertainment and shows' },
  // --- Taba Heights Grand Resort (h9) ---
  { id: 't26', hotelId: 'h9', name: 'Taba Elite', type: 'BEACH_ANIMATION', color: '#0ea5e9', memberCount: 6, leaderId: 'u70', leaderName: 'Wael Hosny', description: 'Golf of Aqaba watersports' },
  { id: 't27', hotelId: 'h9', name: 'Taba Kids', type: 'KIDS_CLUB', color: '#f97316', memberCount: 3, leaderId: 'u71', leaderName: 'Claire Fontaine', description: 'Kids club and family activities' },
  { id: 't28', hotelId: 'h9', name: 'Desert Nights Show', type: 'EVENING_SHOW', color: '#8b5cf6', memberCount: 5, leaderId: 'u72', leaderName: 'Khaled Samir', description: 'Cultural shows and Bedouin nights' },
]

export const ANIMATORS: Animator[] = [
  // --- Sunrise Palace Resort (h1) ---
  { id: 'u1',  hotelId: 'h1', firstName: 'Youssef',    lastName: 'El-Sayed',  email: 'y.elsayed@example.com',   phone: '+20 100 123 4567', role: 'ANIMATION_CHIEF', teamId: 't1', teamName: 'Beach Squad',   nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],   specialties: ['Management', 'Sports', 'Dance'],             contractType: 'FULL_TIME', startDate: '2022-03-01', isActive: true,  performance: 94, attendanceRate: 98 },
  { id: 'u2',  hotelId: 'h1', firstName: 'Marco',      lastName: 'Rossi',     email: 'm.rossi@example.com',     phone: '+39 333 456 7890', role: 'TEAM_LEADER',     teamId: 't1', teamName: 'Beach Squad',   nationality: 'Italian',  languages: ['Italian', 'English', 'French'],    specialties: ['Beach Sports', 'Water Polo', 'Snorkeling'],  contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 91, attendanceRate: 96 },
  { id: 'u3',  hotelId: 'h1', firstName: 'Ahmed',      lastName: 'Khalil',    email: 'a.khalil@example.com',    phone: '+20 111 234 5678', role: 'TEAM_LEADER',     teamId: 't4', teamName: 'Evening Show',  nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Dance', 'MC', 'Drama'],                     contractType: 'FULL_TIME', startDate: '2021-06-15', isActive: true,  performance: 88, attendanceRate: 95 },
  { id: 'u4',  hotelId: 'h1', firstName: 'Lena',       lastName: 'Müller',    email: 'l.muller@example.com',    phone: '+49 151 234 5678', role: 'ANIMATOR',        teamId: 't1', teamName: 'Beach Squad',   nationality: 'German',   languages: ['German', 'English', 'Spanish'],    specialties: ['Yoga', 'Beach Volleyball', 'Zumba'],         contractType: 'SEASONAL',  startDate: '2024-05-01', isActive: true,  performance: 85, attendanceRate: 97 },
  { id: 'u5',  hotelId: 'h1', firstName: 'Amira',      lastName: 'Hassan',    email: 'am.hassan@example.com',   phone: '+20 122 345 6789', role: 'TEAM_LEADER',     teamId: 't2', teamName: 'Pool Stars',    nationality: 'Egyptian', languages: ['Arabic', 'English', 'Russian'],    specialties: ['Aqua Aerobics', 'Water Games'],              contractType: 'FULL_TIME', startDate: '2020-09-01', isActive: true,  performance: 93, attendanceRate: 99 },
  { id: 'u6',  hotelId: 'h1', firstName: 'Dmitri',     lastName: 'Volkov',    email: 'd.volkov@example.com',    phone: '+7 916 123 4567',  role: 'ANIMATOR',        teamId: 't2', teamName: 'Pool Stars',    nationality: 'Russian',  languages: ['Russian', 'English'],              specialties: ['Swimming', 'Water Polo'],                    contractType: 'SEASONAL',  startDate: '2024-04-15', isActive: true,  performance: 79, attendanceRate: 92 },
  { id: 'u7',  hotelId: 'h1', firstName: 'Fatima',     lastName: 'Zahra',     email: 'f.zahra@example.com',     phone: '+20 155 456 7890', role: 'ANIMATOR',        teamId: 't4', teamName: 'Evening Show',  nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],    specialties: ['Belly Dance', 'Folk Dance'],                 contractType: 'FULL_TIME', startDate: '2023-01-10', isActive: true,  performance: 90, attendanceRate: 94 },
  { id: 'u8',  hotelId: 'h1', firstName: 'Sophie',     lastName: 'Laurent',   email: 's.laurent@example.com',   phone: '+33 6 12 34 56 78',role: 'TEAM_LEADER',     teamId: 't3', teamName: 'Kids Club',     nationality: 'French',   languages: ['French', 'English', 'Arabic'],     specialties: ['Childcare', 'Crafts', 'Music'],              contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 96, attendanceRate: 100},
  { id: 'u9',  hotelId: 'h1', firstName: 'Omar',       lastName: 'Fathy',     email: 'o.fathy@example.com',     phone: '+20 109 567 8901', role: 'ANIMATOR',        teamId: 't3', teamName: 'Kids Club',     nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Games', 'Arts & Crafts', 'Football'],        contractType: 'FULL_TIME', startDate: '2022-11-01', isActive: true,  performance: 82, attendanceRate: 91 },
  { id: 'u10', hotelId: 'h1', firstName: 'Maria',      lastName: 'Garcia',    email: 'm.garcia@example.com',    phone: '+34 612 345 678',  role: 'ANIMATOR',        teamId: 't4', teamName: 'Evening Show',  nationality: 'Spanish',  languages: ['Spanish', 'English', 'Italian'],   specialties: ['Salsa', 'Show Dance', 'Aerobics'],           contractType: 'SEASONAL',  startDate: '2024-05-15', isActive: true,  performance: 87, attendanceRate: 93 },
  { id: 'u11', hotelId: 'h1', firstName: 'Carlos',     lastName: 'Mendez',    email: 'c.mendez@example.com',    phone: '+52 55 1234 5678', role: 'TEAM_LEADER',     teamId: 't5', teamName: 'Sports Team',   nationality: 'Mexican',  languages: ['Spanish', 'English'],              specialties: ['Football', 'Beach Volleyball', 'Tennis'],    contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 89, attendanceRate: 97 },
  { id: 'u12', hotelId: 'h1', firstName: 'Hana',       lastName: 'Novak',     email: 'h.novak@example.com',     phone: '+420 601 234 567', role: 'ANIMATOR',        teamId: 't5', teamName: 'Sports Team',   nationality: 'Czech',    languages: ['Czech', 'English', 'German'],      specialties: ['Tennis', 'Table Tennis', 'Fitness'],         contractType: 'SEASONAL',  startDate: '2024-04-15', isActive: true,  performance: 84, attendanceRate: 96 },
  { id: 'u13', hotelId: 'h1', firstName: 'Jean-Pierre',lastName: 'Dubois',    email: 'jp.dubois@example.com',   phone: '+33 6 23 45 67 89',role: 'ENTERTAINER',     teamId: 't4', teamName: 'Evening Show',  nationality: 'French',   languages: ['French', 'English'],               specialties: ['DJ', 'Music', 'Sound Engineering'],          contractType: 'SEASONAL',  startDate: '2024-05-01', isActive: true,  performance: 91, attendanceRate: 98 },
  { id: 'u14', hotelId: 'h1', firstName: 'Nadia',      lastName: 'Petrov',    email: 'n.petrov@example.com',    phone: '+7 925 678 9012',  role: 'TEAM_LEADER',     teamId: 't6', teamName: 'Aqua Gym',      nationality: 'Russian',  languages: ['Russian', 'English'],              specialties: ['Aqua Fitness', 'Pilates', 'Zumba'],          contractType: 'SEASONAL',  startDate: '2024-04-20', isActive: true,  performance: 92, attendanceRate: 99 },
  { id: 'u15', hotelId: 'h1', firstName: 'Karim',      lastName: 'Mansour',   email: 'k.mansour@example.com',   phone: '+20 120 789 0123', role: 'LIFEGUARD',       teamId: 't2', teamName: 'Pool Stars',    nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Lifesaving', 'First Aid', 'Swimming'],       contractType: 'FULL_TIME', startDate: '2021-04-01', isActive: true,  performance: 95, attendanceRate: 99 },
  // --- Sunrise Lagoon Hotel (h2) ---
  { id: 'u20', hotelId: 'h2', firstName: 'Rania',      lastName: 'Saleh',     email: 'r.saleh@example.com',     phone: '+20 100 200 3001', role: 'ANIMATION_CHIEF', teamId: 't7', teamName: 'Lagoon Divers', nationality: 'Egyptian', languages: ['Arabic', 'English', 'Italian'],    specialties: ['Diving', 'Management', 'Water Sports'],     contractType: 'FULL_TIME', startDate: '2021-01-15', isActive: true,  performance: 93, attendanceRate: 97 },
  { id: 'u21', hotelId: 'h2', firstName: 'Luca',       lastName: 'Bianchi',   email: 'l.bianchi@example.com',   phone: '+39 347 123 4567', role: 'ANIMATOR',        teamId: 't7', teamName: 'Lagoon Divers', nationality: 'Italian',  languages: ['Italian', 'English'],              specialties: ['Scuba Diving', 'Snorkeling', 'Kayaking'],    contractType: 'SEASONAL',  startDate: '2024-04-10', isActive: true,  performance: 88, attendanceRate: 95 },
  { id: 'u22', hotelId: 'h2', firstName: 'Piotr',      lastName: 'Kowalski',  email: 'p.kowalski@example.com',  phone: '+48 601 234 567',  role: 'TEAM_LEADER',     teamId: 't8', teamName: 'Aqua Fun',      nationality: 'Polish',   languages: ['Polish', 'English', 'Russian'],    specialties: ['Water Games', 'Pool Animation', 'Aqua Polo'],contractType: 'SEASONAL',  startDate: '2024-03-20', isActive: true,  performance: 86, attendanceRate: 94 },
  { id: 'u23', hotelId: 'h2', firstName: 'Yasmine',    lastName: 'Omar',      email: 'yas.omar@example.com',    phone: '+20 115 678 9012', role: 'ANIMATOR',        teamId: 't8', teamName: 'Aqua Fun',      nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Swimming', 'Water Aerobics'],                contractType: 'FULL_TIME', startDate: '2023-06-01', isActive: true,  performance: 81, attendanceRate: 93 },
  { id: 'u24', hotelId: 'h2', firstName: 'Elena',      lastName: 'Russo',     email: 'e.russo@example.com',     phone: '+39 335 456 7890', role: 'TEAM_LEADER',     teamId: 't9', teamName: 'Mini Stars',    nationality: 'Italian',  languages: ['Italian', 'English', 'French'],    specialties: ['Childcare', 'Drama', 'Dance'],               contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 90, attendanceRate: 98 },
  { id: 'u25', hotelId: 'h2', firstName: 'Tarek',      lastName: 'Nour',      email: 't.nour@example.com',      phone: '+20 112 345 6789', role: 'TEAM_LEADER',     teamId: 't10',teamName: 'Stage Crew',    nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],    specialties: ['Theater', 'MC', 'Lighting'],                 contractType: 'FULL_TIME', startDate: '2022-08-01', isActive: true,  performance: 89, attendanceRate: 96 },
  // --- Azure Beach Resort (h3) ---
  { id: 'u30', hotelId: 'h3', firstName: 'Sofia',      lastName: 'Papadaki',  email: 's.papadaki@example.com',  phone: '+30 694 123 4567', role: 'ANIMATION_CHIEF', teamId: 't11',teamName: 'Azure Waves',   nationality: 'Greek',    languages: ['Greek', 'English', 'French'],      specialties: ['Management', 'Beach Sports', 'Event Org'],  contractType: 'FULL_TIME', startDate: '2020-05-01', isActive: true,  performance: 95, attendanceRate: 99 },
  { id: 'u31', hotelId: 'h3', firstName: 'Hassan',     lastName: 'Badr',      email: 'h.badr@example.com',      phone: '+20 111 900 1234', role: 'ANIMATOR',        teamId: 't11',teamName: 'Azure Waves',   nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Beach Volleyball', 'Windsurfing'],           contractType: 'SEASONAL',  startDate: '2024-04-05', isActive: true,  performance: 84, attendanceRate: 92 },
  { id: 'u32', hotelId: 'h3', firstName: 'Mikael',     lastName: 'Lindqvist', email: 'm.lindqvist@example.com', phone: '+46 701 234 567',  role: 'TEAM_LEADER',     teamId: 't12',teamName: 'Splash Zone',   nationality: 'Swedish',  languages: ['Swedish', 'English', 'German'],    specialties: ['Aqua Fitness', 'Personal Training'],         contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 91, attendanceRate: 97 },
  { id: 'u33', hotelId: 'h3', firstName: 'Alia',       lastName: 'Farouk',    email: 'a.farouk@example.com',    phone: '+20 128 456 7890', role: 'TEAM_LEADER',     teamId: 't13',teamName: 'Champions',     nationality: 'Egyptian', languages: ['Arabic', 'English', 'Spanish'],    specialties: ['Tennis', 'Football', 'Fitness'],             contractType: 'FULL_TIME', startDate: '2021-09-01', isActive: true,  performance: 87, attendanceRate: 95 },
  // --- Azure Coral Club (h4) ---
  { id: 'u40', hotelId: 'h4', firstName: 'Bruno',      lastName: 'Ferreira',  email: 'b.ferreira@example.com',  phone: '+351 912 345 678', role: 'ANIMATION_CHIEF', teamId: 't14',teamName: 'Coral Divers',  nationality: 'Portuguese',languages: ['Portuguese', 'English', 'French'],  specialties: ['Diving', 'Snorkeling', 'Management'],       contractType: 'FULL_TIME', startDate: '2022-02-01', isActive: true,  performance: 92, attendanceRate: 98 },
  { id: 'u41', hotelId: 'h4', firstName: 'Yasmin',     lastName: 'Khalid',    email: 'y.khalid@example.com',    phone: '+20 100 567 8901', role: 'TEAM_LEADER',     teamId: 't15',teamName: 'Sunset Show',   nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Belly Dance', 'MC', 'Entertainment'],       contractType: 'FULL_TIME', startDate: '2023-03-15', isActive: true,  performance: 90, attendanceRate: 96 },
  { id: 'u42', hotelId: 'h4', firstName: 'Pierre',     lastName: 'Morin',     email: 'p.morin@example.com',     phone: '+33 6 78 90 12 34',role: 'ENTERTAINER',     teamId: 't15',teamName: 'Sunset Show',   nationality: 'French',   languages: ['French', 'English', 'Arabic'],     specialties: ['Acrobatics', 'Dance', 'Fire Show'],         contractType: 'SEASONAL',  startDate: '2024-04-20', isActive: true,  performance: 88, attendanceRate: 94 },
  { id: 'u43', hotelId: 'h4', firstName: 'Anna',       lastName: 'Becker',    email: 'a.becker@example.com',    phone: '+49 160 234 5678', role: 'TEAM_LEADER',     teamId: 't16',teamName: 'Little Corals', nationality: 'German',   languages: ['German', 'English', 'Arabic'],     specialties: ['Childcare', 'Arts & Crafts', 'Music'],      contractType: 'SEASONAL',  startDate: '2024-04-15', isActive: true,  performance: 89, attendanceRate: 97 },
  // --- Gouna Pearl Resort (h5) ---
  { id: 'u50', hotelId: 'h5', firstName: 'Mina',       lastName: 'Girgis',    email: 'm.girgis@example.com',    phone: '+20 100 111 2233', role: 'ANIMATION_CHIEF', teamId: 't17',teamName: 'Marina Waves',  nationality: 'Egyptian', languages: ['Arabic', 'English', 'Italian'],    specialties: ['Water Sports', 'Diving', 'Management'],     contractType: 'FULL_TIME', startDate: '2021-05-01', isActive: true,  performance: 94, attendanceRate: 98 },
  { id: 'u51', hotelId: 'h5', firstName: 'Dina',       lastName: 'Ashraf',    email: 'd.ashraf@example.com',    phone: '+20 122 334 4556', role: 'TEAM_LEADER',     teamId: 't18',teamName: 'Gouna Stars',   nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],    specialties: ['Dance', 'MC', 'Choreography'],              contractType: 'FULL_TIME', startDate: '2022-09-01', isActive: true,  performance: 91, attendanceRate: 96 },
  { id: 'u52', hotelId: 'h5', firstName: 'Sylvia',     lastName: 'Kern',      email: 's.kern@example.com',      phone: '+43 699 123 4567', role: 'TEAM_LEADER',     teamId: 't19',teamName: 'Pearl Kids',    nationality: 'Austrian', languages: ['German', 'English', 'French'],    specialties: ['Childcare', 'Crafts', 'Storytelling'],      contractType: 'SEASONAL',  startDate: '2024-04-10', isActive: true,  performance: 92, attendanceRate: 99 },
  { id: 'u53', hotelId: 'h5', firstName: 'Hossam',     lastName: 'Ragab',     email: 'h.ragab@example.com',     phone: '+20 115 456 7788', role: 'ANIMATOR',        teamId: 't17',teamName: 'Marina Waves',  nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Kitesurfing', 'Kayaking', 'Beach Volley'],  contractType: 'FULL_TIME', startDate: '2023-03-01', isActive: true,  performance: 85, attendanceRate: 93 },
  // --- Makadi Bay Grand Hotel (h6) ---
  { id: 'u55', hotelId: 'h6', firstName: 'Adel',       lastName: 'Farid',     email: 'a.farid@example.com',     phone: '+20 109 877 6655', role: 'ANIMATION_CHIEF', teamId: 't20',teamName: 'Makadi Splash', nationality: 'Egyptian', languages: ['Arabic', 'English', 'Russian'],    specialties: ['Aqua Animation', 'Event Org', 'Sports'],    contractType: 'FULL_TIME', startDate: '2020-11-01', isActive: true,  performance: 93, attendanceRate: 97 },
  { id: 'u56', hotelId: 'h6', firstName: 'Sven',       lastName: 'Olsen',     email: 's.olsen@example.com',     phone: '+47 901 234 567',  role: 'TEAM_LEADER',     teamId: 't21',teamName: 'Bay Sports',    nationality: 'Norwegian',languages: ['Norwegian', 'English', 'German'],   specialties: ['Fitness', 'Tennis', 'Football'],            contractType: 'SEASONAL',  startDate: '2024-04-05', isActive: true,  performance: 88, attendanceRate: 95 },
  { id: 'u57', hotelId: 'h6', firstName: 'Mariam',     lastName: 'Kamal',     email: 'm.kamal@example.com',     phone: '+20 128 900 1122', role: 'ANIMATOR',        teamId: 't20',teamName: 'Makadi Splash', nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Zumba', 'Aqua Gym', 'Pool Games'],          contractType: 'FULL_TIME', startDate: '2023-07-01', isActive: true,  performance: 86, attendanceRate: 94 },
  // --- Ain Sokhna Marina Resort (h7) ---
  { id: 'u60', hotelId: 'h7', firstName: 'Nour',       lastName: 'Essam',     email: 'n.essam@example.com',     phone: '+20 111 765 4321', role: 'ANIMATION_CHIEF', teamId: 't22',teamName: 'Sokhna Beats',  nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Entertainment', 'Event Org', 'Dance'],      contractType: 'FULL_TIME', startDate: '2022-01-15', isActive: true,  performance: 90, attendanceRate: 96 },
  { id: 'u61', hotelId: 'h7', firstName: 'Petra',      lastName: 'Novak',     email: 'p.novak2@example.com',    phone: '+420 722 345 678', role: 'TEAM_LEADER',     teamId: 't23',teamName: 'Sokhna Aqua',   nationality: 'Czech',    languages: ['Czech', 'English', 'German'],     specialties: ['Aqua Fitness', 'Yoga', 'Pilates'],          contractType: 'SEASONAL',  startDate: '2024-04-20', isActive: true,  performance: 87, attendanceRate: 97 },
  // --- Dahab Blue Lagoon Hotel (h8) ---
  { id: 'u65', hotelId: 'h8', firstName: 'Ahmed',      lastName: 'Saber',     email: 'ah.saber@example.com',    phone: '+20 100 543 2109', role: 'ANIMATION_CHIEF', teamId: 't24',teamName: 'Dahab Divers',  nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],    specialties: ['Freediving', 'Scuba', 'Management'],        contractType: 'FULL_TIME', startDate: '2021-08-01', isActive: true,  performance: 95, attendanceRate: 99 },
  { id: 'u66', hotelId: 'h8', firstName: 'Isabelle',   lastName: 'Marin',     email: 'i.marin@example.com',     phone: '+32 470 123 456',  role: 'TEAM_LEADER',     teamId: 't25',teamName: 'Lagoon Lights', nationality: 'Belgian',  languages: ['French', 'English', 'Arabic'],    specialties: ['Theater', 'Fire Show', 'Acrobatics'],       contractType: 'SEASONAL',  startDate: '2024-03-25', isActive: true,  performance: 89, attendanceRate: 95 },
  { id: 'u67', hotelId: 'h8', firstName: 'Omar',       lastName: 'Hatem',     email: 'o.hatem@example.com',     phone: '+20 120 987 6543', role: 'ANIMATOR',        teamId: 't24',teamName: 'Dahab Divers',  nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Snorkeling', 'Kayaking', 'Windsurfing'],    contractType: 'FULL_TIME', startDate: '2023-05-01', isActive: true,  performance: 83, attendanceRate: 92 },
  // --- Taba Heights Grand Resort (h9) ---
  { id: 'u70', hotelId: 'h9', firstName: 'Wael',       lastName: 'Hosny',     email: 'w.hosny@example.com',     phone: '+20 111 234 0099', role: 'ANIMATION_CHIEF', teamId: 't26',teamName: 'Taba Elite',    nationality: 'Egyptian', languages: ['Arabic', 'English', 'Hebrew'],    specialties: ['Water Sports', 'Management', 'Cultural'],   contractType: 'FULL_TIME', startDate: '2020-07-01', isActive: true,  performance: 96, attendanceRate: 99 },
  { id: 'u71', hotelId: 'h9', firstName: 'Claire',     lastName: 'Fontaine',  email: 'c.fontaine@example.com',  phone: '+33 6 45 67 89 01',role: 'TEAM_LEADER',     teamId: 't27',teamName: 'Taba Kids',     nationality: 'French',   languages: ['French', 'English', 'Arabic'],    specialties: ['Childcare', 'Crafts', 'Language Play'],     contractType: 'SEASONAL',  startDate: '2024-04-01', isActive: true,  performance: 93, attendanceRate: 100},
  { id: 'u72', hotelId: 'h9', firstName: 'Khaled',     lastName: 'Samir',     email: 'k.samir@example.com',     phone: '+20 122 876 5432', role: 'TEAM_LEADER',     teamId: 't28',teamName: 'Desert Nights', nationality: 'Egyptian', languages: ['Arabic', 'English', 'French'],    specialties: ['Bedouin Culture', 'MC', 'Oriental Dance'],  contractType: 'FULL_TIME', startDate: '2022-11-01', isActive: true,  performance: 91, attendanceRate: 97 },
  { id: 'u73', hotelId: 'h9', firstName: 'Yara',       lastName: 'Nabil',     email: 'y.nabil@example.com',     phone: '+20 109 765 4321', role: 'ANIMATOR',        teamId: 't28',teamName: 'Desert Nights', nationality: 'Egyptian', languages: ['Arabic', 'English'],               specialties: ['Belly Dance', 'Folklore', 'Tanoura'],       contractType: 'FULL_TIME', startDate: '2023-02-15', isActive: true,  performance: 88, attendanceRate: 95 },
]

export const ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Aqua Gym', nameAr: 'ايروبيك مائي', type: 'AQUA_GYM', venue: 'Main Pool', duration: 45, minAnimators: 1, maxGuests: 30, ageGroup: 'ADULTS', equipment: ['Noodles', 'Water weights'], isActive: true },
  { id: 'a2', name: 'Beach Volleyball', nameAr: 'كرة طائرة شاطئية', type: 'SPORTS', venue: 'Beach Court', duration: 60, minAnimators: 2, maxGuests: 12, ageGroup: 'ALL', equipment: ['Volleyball net', 'Ball'], isActive: true },
  { id: 'a3', name: 'Kids Disco', nameAr: 'ديسكو الأطفال', type: 'KIDS_ACTIVITY', venue: 'Mini Club', duration: 60, minAnimators: 2, maxGuests: 40, ageGroup: 'KIDS', equipment: ['Sound system', 'Lights'], isActive: true },
  { id: 'a4', name: 'Zumba', nameAr: 'زومبا', type: 'DANCE_CLASS', venue: 'Pool Terrace', duration: 50, minAnimators: 1, maxGuests: 50, ageGroup: 'ALL', equipment: ['Sound system'], isActive: true },
  { id: 'a5', name: 'Gala Night Show', nameAr: 'عرض السهرة', type: 'EVENING_SHOW', venue: 'Amphitheater', duration: 90, minAnimators: 6, maxGuests: 500, ageGroup: 'ALL', equipment: ['Stage', 'Lights', 'Sound', 'Costumes'], isActive: true },
  { id: 'a6', name: 'Water Polo', nameAr: 'بولو مائي', type: 'WATER_SPORTS', venue: 'Main Pool', duration: 45, minAnimators: 2, maxGuests: 14, ageGroup: 'ADULTS', equipment: ['Goals', 'Ball'], isActive: true },
  { id: 'a7', name: 'Snorkeling Tour', nameAr: 'جولة الغطس', type: 'EXCURSION', venue: 'Beach', duration: 120, minAnimators: 3, maxGuests: 20, ageGroup: 'ADULTS', equipment: ['Masks', 'Fins', 'Snorkels'], isActive: true },
  { id: 'a8', name: 'Football Tournament', nameAr: 'دوري كرة القدم', type: 'SPORTS', venue: 'Sports Field', duration: 90, minAnimators: 2, maxGuests: 22, ageGroup: 'ALL', equipment: ['Goals', 'Balls', 'Bibs'], isActive: true },
  { id: 'a9', name: 'Morning Stretch', nameAr: 'تمارين الإطالة', type: 'FITNESS', venue: 'Beach', duration: 30, minAnimators: 1, maxGuests: 40, ageGroup: 'ALL', equipment: ['Mats'], isActive: true },
  { id: 'a10', name: 'Arabic Night Show', nameAr: 'ليلة عربية', type: 'CULTURAL', venue: 'Amphitheater', duration: 90, minAnimators: 4, maxGuests: 400, ageGroup: 'ALL', equipment: ['Stage', 'Costumes', 'Lights'], isActive: true },
  { id: 'a11', name: 'Mini Olympics', nameAr: 'أولمبياد صغير', type: 'GAME', venue: 'Sports Field', duration: 120, minAnimators: 4, maxGuests: 60, ageGroup: 'ALL', equipment: ['Cones', 'Balls', 'Trophies'], isActive: true },
  { id: 'a12', name: 'Salsa Class', nameAr: 'دروس السالسا', type: 'DANCE_CLASS', venue: 'Pool Terrace', duration: 45, minAnimators: 2, maxGuests: 30, ageGroup: 'ADULTS', equipment: ['Sound system'], isActive: true },
]

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

export const SCHEDULE_ENTRIES: ScheduleEntry[] = [
  // --- Sunrise Palace Resort (h1) Today ---
  { id: 'se1',  hotelId: 'h1', animatorId: 'u2',  animatorName: 'Marco Rossi',   teamId: 't1', activityId: 'a2',  activityName: 'Beach Volleyball',  venue: 'Beach Court',  date: fmt(today),           startTime: '09:00', endTime: '10:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se2',  hotelId: 'h1', animatorId: 'u4',  animatorName: 'Lena Müller',   teamId: 't1', activityId: 'a9',  activityName: 'Morning Stretch',    venue: 'Beach',        date: fmt(today),           startTime: '08:00', endTime: '08:30', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se3',  hotelId: 'h1', animatorId: 'u5',  animatorName: 'Amira Hassan',  teamId: 't2', activityId: 'a1',  activityName: 'Aqua Gym',           venue: 'Main Pool',    date: fmt(today),           startTime: '10:00', endTime: '10:45', type: 'ACTIVITY', status: 'IN_PROGRESS', attendance: 'PRESENT' },
  { id: 'se4',  hotelId: 'h1', animatorId: 'u8',  animatorName: 'Sophie Laurent',teamId: 't3', activityId: 'a3',  activityName: 'Kids Disco',         venue: 'Mini Club',    date: fmt(today),           startTime: '11:00', endTime: '12:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se5',  hotelId: 'h1', animatorId: 'u14', animatorName: 'Nadia Petrov',  teamId: 't6', activityId: 'a1',  activityName: 'Aqua Gym',           venue: 'Main Pool',    date: fmt(today),           startTime: '09:00', endTime: '09:45', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se6',  hotelId: 'h1', animatorId: 'u3',  animatorName: 'Ahmed Khalil',  teamId: 't4', activityId: 'a5',  activityName: 'Gala Night Show',    venue: 'Amphitheater', date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se7',  hotelId: 'h1', animatorId: 'u7',  animatorName: 'Fatima Zahra',  teamId: 't4', activityId: 'a5',  activityName: 'Gala Night Show',    venue: 'Amphitheater', date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se8',  hotelId: 'h1', animatorId: 'u11', animatorName: 'Carlos Mendez', teamId: 't5', activityId: 'a8',  activityName: 'Football Tournament', venue: 'Sports Field', date: fmt(today),           startTime: '16:00', endTime: '17:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se9',  hotelId: 'h1', animatorId: 'u6',  animatorName: 'Dmitri Volkov', teamId: 't2', activityId: 'a6',  activityName: 'Water Polo',         venue: 'Main Pool',    date: fmt(today),           startTime: '15:00', endTime: '15:45', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se10', hotelId: 'h1', animatorId: 'u12', animatorName: 'Hana Novak',    teamId: 't5', activityId: 'a2',  activityName: 'Beach Volleyball',   venue: 'Beach Court',  date: fmt(today),           startTime: '17:00', endTime: '18:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se11', hotelId: 'h1', animatorId: 'u2',  animatorName: 'Marco Rossi',   teamId: 't1', activityId: 'a7',  activityName: 'Snorkeling Tour',    venue: 'Beach',        date: fmt(addDays(today,1)),startTime: '09:00', endTime: '11:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se12', hotelId: 'h1', animatorId: 'u5',  animatorName: 'Amira Hassan',  teamId: 't2', activityId: 'a4',  activityName: 'Zumba',              venue: 'Pool Terrace', date: fmt(addDays(today,1)),startTime: '10:00', endTime: '10:50', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se13', hotelId: 'h1', animatorId: 'u10', animatorName: 'Maria Garcia',  teamId: 't4', activityId: 'a12', activityName: 'Salsa Class',        venue: 'Pool Terrace', date: fmt(addDays(today,1)),startTime: '19:00', endTime: '19:45', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se14', hotelId: 'h1', animatorId: 'u3',  animatorName: 'Ahmed Khalil',  teamId: 't4', activityId: 'a10', activityName: 'Arabic Night Show',  venue: 'Amphitheater', date: fmt(addDays(today,2)),startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se15', hotelId: 'h1', animatorId: 'u14', animatorName: 'Nadia Petrov',  teamId: 't6', activityId: 'a1',  activityName: 'Aqua Gym',           venue: 'Main Pool',    date: fmt(addDays(today,2)),startTime: '09:00', endTime: '09:45', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Sunrise Lagoon Hotel (h2) Today ---
  { id: 'se20', hotelId: 'h2', animatorId: 'u20', animatorName: 'Rania Saleh',   teamId: 't7', activityId: 'a7',  activityName: 'Snorkeling Tour',    venue: 'Lagoon Beach', date: fmt(today),           startTime: '09:00', endTime: '11:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se21', hotelId: 'h2', animatorId: 'u22', animatorName: 'Piotr Kowalski',teamId: 't8', activityId: 'a6',  activityName: 'Water Polo',         venue: 'Lagoon Pool',  date: fmt(today),           startTime: '10:00', endTime: '10:45', type: 'ACTIVITY', status: 'IN_PROGRESS', attendance: 'PRESENT' },
  { id: 'se22', hotelId: 'h2', animatorId: 'u24', animatorName: 'Elena Russo',   teamId: 't9', activityId: 'a3',  activityName: 'Kids Disco',         venue: 'Mini Club',    date: fmt(today),           startTime: '11:00', endTime: '12:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se23', hotelId: 'h2', animatorId: 'u25', animatorName: 'Tarek Nour',    teamId: 't10',activityId: 'a5',  activityName: 'Gala Night Show',    venue: 'Stage Area',   date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Azure Beach Resort (h3) Today ---
  { id: 'se30', hotelId: 'h3', animatorId: 'u30', animatorName: 'Sofia Papadaki',teamId: 't11',activityId: 'a2',  activityName: 'Beach Volleyball',   venue: 'Azure Beach',  date: fmt(today),           startTime: '09:00', endTime: '10:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se31', hotelId: 'h3', animatorId: 'u32', animatorName: 'Mikael Lindqvist',teamId:'t12',activityId: 'a1', activityName: 'Aqua Gym',           venue: 'Main Pool',    date: fmt(today),           startTime: '10:00', endTime: '10:45', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se32', hotelId: 'h3', animatorId: 'u33', animatorName: 'Alia Farouk',   teamId: 't13',activityId: 'a8',  activityName: 'Football Tournament', venue: 'Sports Court', date: fmt(today),           startTime: '15:00', endTime: '16:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Azure Coral Club (h4) Today ---
  { id: 'se40', hotelId: 'h4', animatorId: 'u40', animatorName: 'Bruno Ferreira',teamId: 't14',activityId: 'a7',  activityName: 'Snorkeling Tour',    venue: 'Coral Reef',      date: fmt(today),           startTime: '08:30', endTime: '10:30', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se41', hotelId: 'h4', animatorId: 'u41', animatorName: 'Yasmin Khalid', teamId: 't15',activityId: 'a5',  activityName: 'Sunset Show',        venue: 'Amphitheater',    date: fmt(today),           startTime: '20:30', endTime: '22:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se42', hotelId: 'h4', animatorId: 'u43', animatorName: 'Anna Becker',   teamId: 't16',activityId: 'a3',  activityName: 'Kids Disco',         venue: 'Kids Area',       date: fmt(today),           startTime: '11:00', endTime: '12:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Gouna Pearl Resort (h5) Today ---
  { id: 'se50', hotelId: 'h5', animatorId: 'u50', animatorName: 'Mina Girgis',   teamId: 't17',activityId: 'a7',  activityName: 'Snorkeling Tour',    venue: 'Gouna Lagoon',    date: fmt(today),           startTime: '09:00', endTime: '11:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se51', hotelId: 'h5', animatorId: 'u51', animatorName: 'Dina Ashraf',   teamId: 't18',activityId: 'a5',  activityName: 'Gala Night Show',    venue: 'Pearl Theater',   date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se52', hotelId: 'h5', animatorId: 'u52', animatorName: 'Sylvia Kern',   teamId: 't19',activityId: 'a3',  activityName: 'Kids Disco',         venue: 'Mini Club',       date: fmt(today),           startTime: '11:00', endTime: '12:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Makadi Bay Grand Hotel (h6) Today ---
  { id: 'se60', hotelId: 'h6', animatorId: 'u55', animatorName: 'Adel Farid',    teamId: 't20',activityId: 'a1',  activityName: 'Aqua Gym',           venue: 'Bay Pool',        date: fmt(today),           startTime: '09:30', endTime: '10:15', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se61', hotelId: 'h6', animatorId: 'u56', animatorName: 'Sven Olsen',    teamId: 't21',activityId: 'a8',  activityName: 'Football Tournament',venue: 'Sports Field',    date: fmt(today),           startTime: '16:00', endTime: '17:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Ain Sokhna Marina Resort (h7) Today ---
  { id: 'se70', hotelId: 'h7', animatorId: 'u60', animatorName: 'Nour Essam',    teamId: 't22',activityId: 'a4',  activityName: 'Zumba',              venue: 'Pool Deck',       date: fmt(today),           startTime: '10:00', endTime: '10:50', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se71', hotelId: 'h7', animatorId: 'u61', animatorName: 'Petra Novak',   teamId: 't23',activityId: 'a1',  activityName: 'Aqua Gym',           venue: 'Marina Pool',     date: fmt(today),           startTime: '11:00', endTime: '11:45', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Dahab Blue Lagoon Hotel (h8) Today ---
  { id: 'se80', hotelId: 'h8', animatorId: 'u65', animatorName: 'Ahmed Saber',   teamId: 't24',activityId: 'a7',  activityName: 'Snorkeling Tour',    venue: 'Blue Hole',       date: fmt(today),           startTime: '08:00', endTime: '10:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se81', hotelId: 'h8', animatorId: 'u66', animatorName: 'Isabelle Marin',teamId: 't25',activityId: 'a10', activityName: 'Arabic Night Show',  venue: 'Open Air Stage',  date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  // --- Taba Heights Grand Resort (h9) Today ---
  { id: 'se90', hotelId: 'h9', animatorId: 'u70', animatorName: 'Wael Hosny',    teamId: 't26',activityId: 'a2',  activityName: 'Beach Volleyball',   venue: 'Aqaba Beach',     date: fmt(today),           startTime: '09:00', endTime: '10:00', type: 'ACTIVITY', status: 'COMPLETED',   attendance: 'PRESENT' },
  { id: 'se91', hotelId: 'h9', animatorId: 'u72', animatorName: 'Khaled Samir',  teamId: 't28',activityId: 'a10', activityName: 'Arabic Night Show',  venue: 'Desert Stage',    date: fmt(today),           startTime: '21:00', endTime: '22:30', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
  { id: 'se92', hotelId: 'h9', animatorId: 'u71', animatorName: 'Claire Fontaine',teamId:'t27',activityId: 'a11', activityName: 'Mini Olympics',      venue: 'Kids Garden',     date: fmt(today),           startTime: '10:00', endTime: '12:00', type: 'ACTIVITY', status: 'SCHEDULED',   attendance: undefined },
]

export const ASSIGNMENTS: Assignment[] = [
  { id: 'as1', hotelId: 'h1', title: 'Prepare Gala Night Stage Props',    description: "Set up props and costumes for tonight's Gala Night Show. Coordinate with Jean-Pierre for sound check.", assignedToId: 'u3',  assignedToName: 'Ahmed Khalil',   assignedById: 'u1',  teamId: 't4',  activityName: 'Gala Night Show',  date: fmt(today),            startTime: '18:00', endTime: '20:00', priority: 'HIGH',   status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'as2', hotelId: 'h1', title: 'Equipment Inventory Check',         description: 'Complete monthly inventory of sports equipment and report any damaged items.',                               assignedToId: 'u11', assignedToName: 'Carlos Mendez',  assignedById: 'u1',  teamId: 't5',                                                date: fmt(addDays(today,1)), startTime: '08:00', endTime: '09:00', priority: 'MEDIUM', status: 'PENDING',     createdAt: new Date(Date.now() - 3600000).toISOString()  },
  { id: 'as3', hotelId: 'h1', title: 'Welcome New Guests at Pool',        description: 'Station at main pool entrance, welcome arriving guests and distribute activity schedules.',                  assignedToId: 'u5',  assignedToName: 'Amira Hassan',   assignedById: 'u1',  teamId: 't2',                                                date: fmt(today),            startTime: '14:00', endTime: '16:00', priority: 'MEDIUM', status: 'ACCEPTED',    createdAt: new Date(Date.now() - 7200000).toISOString()  },
  { id: 'as4', hotelId: 'h1', title: 'Safety Briefing for Snorkeling',    description: "Conduct mandatory safety briefing for tomorrow's snorkeling group. Max 20 participants.",                   assignedToId: 'u2',  assignedToName: 'Marco Rossi',    assignedById: 'u1',  teamId: 't1', activityName: 'Snorkeling Tour',  date: fmt(today),            startTime: '19:00', endTime: '19:30', priority: 'HIGH',   status: 'PENDING',     createdAt: new Date(Date.now() - 1800000).toISOString()  },
  { id: 'as5', hotelId: 'h1', title: 'Kids Crafts Preparation',           description: "Prepare craft materials for tomorrow's kids club sessions. Theme: Egyptian Pharaohs.",                      assignedToId: 'u8',  assignedToName: 'Sophie Laurent', assignedById: 'u1',  teamId: 't3',                                                date: fmt(addDays(today,1)), startTime: '08:30', endTime: '09:30', priority: 'MEDIUM', status: 'PENDING',     createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'as6', hotelId: 'h1', title: 'Aqua Gym Music Playlist',           description: 'Update aqua gym music playlist for next week. High-energy mix preferred.',                                  assignedToId: 'u14', assignedToName: 'Nadia Petrov',   assignedById: 'u1',  teamId: 't6',                                                date: fmt(addDays(today,2)), startTime: '10:00', endTime: '11:00', priority: 'LOW',    status: 'COMPLETED',   createdAt: new Date(Date.now() - 172800000).toISOString()},
  { id: 'as7', hotelId: 'h2', title: 'Lagoon Safety Equipment Check',     description: 'Check all snorkeling gear and diving equipment before morning tours.',                                       assignedToId: 'u21', assignedToName: 'Luca Bianchi',   assignedById: 'u20', teamId: 't7',  activityName: 'Snorkeling Tour',  date: fmt(today),            startTime: '07:30', endTime: '08:30', priority: 'HIGH',   status: 'COMPLETED',   createdAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'as8', hotelId: 'h2', title: 'Pool Games Setup',                  description: 'Prepare pool area for afternoon water games tournament.',                                                    assignedToId: 'u22', assignedToName: 'Piotr Kowalski', assignedById: 'u20', teamId: 't8',                                                date: fmt(today),            startTime: '13:00', endTime: '14:00', priority: 'MEDIUM', status: 'ACCEPTED',    createdAt: new Date(Date.now() - 21600000).toISOString() },
  { id: 'as9', hotelId: 'h3', title: 'Beach Tournament Logistics',        description: 'Organize the beach volleyball tournament brackets and prize table.',                                         assignedToId: 'u33', assignedToName: 'Alia Farouk',    assignedById: 'u30', teamId: 't13',                                               date: fmt(today),            startTime: '14:00', endTime: '15:00', priority: 'HIGH',   status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 'as10',hotelId: 'h4', title: 'Sunset Show Costume Prep',          description: "Lay out and prepare all costumes for tonight's sunset performance.",                                         assignedToId: 'u42', assignedToName: 'Pierre Morin',   assignedById: 'u40', teamId: 't15', activityName: 'Sunset Show',      date: fmt(today),            startTime: '17:00', endTime: '18:00', priority: 'HIGH',   status: 'PENDING',     createdAt: new Date(Date.now() - 5400000).toISOString()  },
]

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'an1', hotelId: 'h1', title: 'VIP Group Arriving Tomorrow',  content: 'A VIP group of 150 guests from Russia will arrive tomorrow afternoon. All teams please ensure top presentation. Extra activities planned from 16:00.', type: 'URGENT',         priority: 'URGENT',  targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR'],                                        isActive: true, createdAt: new Date(Date.now() - 3600000).toISOString(),   authorName: 'Youssef El-Sayed' },
  { id: 'an2', hotelId: 'h1', title: 'Weekly Schedule Published',    content: 'The schedule for next week (Week 23) has been published. Please review your assignments and confirm any conflicts by Thursday.',                          type: 'SCHEDULE_CHANGE',priority: 'HIGH',    targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR', 'ENTERTAINER', 'LIFEGUARD', 'KIDS_CLUB'],isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString(),  authorName: 'Youssef El-Sayed' },
  { id: 'an3', hotelId: 'h1', title: 'CPR & First Aid Training',     content: 'Mandatory CPR and First Aid refresher for all animators and lifeguards. Next Monday 09:00 — Hotel Conference Room B.',                                    type: 'TRAINING',       priority: 'HIGH',    targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR', 'LIFEGUARD'],                            isActive: true, createdAt: new Date(Date.now() - 172800000).toISOString(), expiresAt: addDays(today,5).toISOString(), authorName: 'Hotel Admin' },
  { id: 'an4', hotelId: 'h1', title: 'New Activity: Sunrise Yoga',   content: 'Starting next week — Sunrise Yoga every Tuesday and Thursday at 06:30 on the beach. Led by Nadia Petrov. Maximum 20 guests.',                          type: 'GENERAL',        priority: 'MEDIUM',  targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR'],                                        isActive: true, createdAt: new Date(Date.now() - 259200000).toISOString(), authorName: 'Youssef El-Sayed' },
  { id: 'an5', hotelId: 'h1', title: 'Gala Night: Egyptian Theme',   content: "This week's Gala Night will have an Egyptian Pharaoh theme. All evening show team members must wear traditional costumes. Rehearsal at 19:00 tonight.", type: 'EVENT',          priority: 'HIGH',    targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR', 'ENTERTAINER'],                          isActive: true, createdAt: new Date(Date.now() - 43200000).toISOString(),  authorName: 'Ahmed Khalil'     },
  { id: 'an6', hotelId: 'h1', title: 'Dress Code Reminder',          content: 'All team members must wear official AnimaPro uniforms during working hours. Uniforms should be clean and name badges visible at all times.',             type: 'POLICY',         priority: 'MEDIUM',  targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR', 'ENTERTAINER', 'LIFEGUARD', 'KIDS_CLUB'],isActive: true, createdAt: new Date(Date.now() - 432000000).toISOString(), authorName: 'Hotel Admin'      },
  { id: 'an7', hotelId: 'h2', title: 'Lagoon Diving Season Opening',  content: 'The lagoon diving season officially opens this weekend. All dive instructors must complete their refresher certification by Friday.',                  type: 'TRAINING',       priority: 'HIGH',    targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR'],                                        isActive: true, createdAt: new Date(Date.now() - 57600000).toISOString(),  authorName: 'Rania Saleh'      },
  { id: 'an8', hotelId: 'h3', title: 'Azure Beach Sports League',    content: 'The inter-hotel sports league kicks off next week. Azure Beach Resort will compete in volleyball and football. Registrations close tomorrow.',         type: 'EVENT',          priority: 'HIGH',    targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR'],                                        isActive: true, createdAt: new Date(Date.now() - 28800000).toISOString(),  authorName: 'Sofia Papadaki'   },
  { id: 'an9', hotelId: 'h4', title: 'Coral Conservation Week',      content: 'This week is Coral Reef Conservation Week. Please brief all guests on responsible snorkeling etiquette. No sunscreen near the reef.',                  type: 'POLICY',         priority: 'URGENT',  targetRoles: ['ANIMATION_CHIEF', 'TEAM_LEADER', 'ANIMATOR', 'LIFEGUARD'],                            isActive: true, createdAt: new Date(Date.now() - 14400000).toISOString(),  authorName: 'Bruno Ferreira'   },
]

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr1', hotelId: 'h1', animatorId: 'u6',  animatorName: 'Dmitri Volkov',  type: 'SICK',      startDate: fmt(addDays(today,3)),  endDate: fmt(addDays(today,4)),  reason: 'Doctor appointment and recovery', status: 'PENDING',  createdAt: new Date(Date.now() - 3600000).toISOString()   },
  { id: 'lr2', hotelId: 'h1', animatorId: 'u10', animatorName: 'Maria Garcia',   type: 'DAY_OFF',   startDate: fmt(addDays(today,7)),  endDate: fmt(addDays(today,7)),  reason: 'Personal errand in Cairo',        status: 'APPROVED', reviewedBy: 'Youssef El-Sayed', createdAt: new Date(Date.now() - 86400000).toISOString()  },
  { id: 'lr3', hotelId: 'h1', animatorId: 'u12', animatorName: 'Hana Novak',     type: 'ANNUAL',    startDate: fmt(addDays(today,14)), endDate: fmt(addDays(today,17)), reason: 'Family visit to Prague',          status: 'PENDING',  createdAt: new Date(Date.now() - 7200000).toISOString()   },
  { id: 'lr4', hotelId: 'h1', animatorId: 'u4',  animatorName: 'Lena Müller',    type: 'EMERGENCY', startDate: fmt(today),             endDate: fmt(today),             reason: 'Family emergency',                status: 'APPROVED', reviewedBy: 'Youssef El-Sayed', createdAt: new Date(Date.now() - 14400000).toISOString()  },
  { id: 'lr5', hotelId: 'h1', animatorId: 'u9',  animatorName: 'Omar Fathy',     type: 'DAY_OFF',   startDate: fmt(addDays(today,5)),  endDate: fmt(addDays(today,5)),  reason: 'Birthday celebration',            status: 'REJECTED', reviewedBy: 'Youssef El-Sayed', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'lr6', hotelId: 'h2', animatorId: 'u21', animatorName: 'Luca Bianchi',   type: 'ANNUAL',    startDate: fmt(addDays(today,10)), endDate: fmt(addDays(today,14)), reason: 'Vacation in Italy',               status: 'PENDING',  createdAt: new Date(Date.now() - 21600000).toISOString()  },
  { id: 'lr7', hotelId: 'h3', animatorId: 'u31', animatorName: 'Hassan Badr',    type: 'SICK',      startDate: fmt(addDays(today,1)),  endDate: fmt(addDays(today,2)),  reason: 'Illness — fever',                 status: 'APPROVED', reviewedBy: 'Sofia Papadaki',   createdAt: new Date(Date.now() - 10800000).toISOString()  },
  { id: 'lr8', hotelId: 'h4', animatorId: 'u42', animatorName: 'Pierre Morin',   type: 'DAY_OFF',   startDate: fmt(addDays(today,3)),  endDate: fmt(addDays(today,3)),  reason: 'Personal day',                    status: 'PENDING',  createdAt: new Date(Date.now() - 5400000).toISOString()   },
]

export const EVENTS: EventItem[] = [
  { id: 'ev1', hotelId: 'h1', name: 'Egyptian Pharaoh Gala Night',    description: 'Spectacular themed evening with traditional costumes, belly dancing, fire show, and Egyptian cuisine.',   date: fmt(today),            startTime: '20:30', endTime: '23:00', venue: 'Amphitheater & Pool Area', type: 'GALA_DINNER',        expectedGuests: 420, status: 'CONFIRMED', assignedAnimators: ['u3','u7','u10','u13','u4'] },
  { id: 'ev2', hotelId: 'h1', name: 'Kids Summer Olympics',           description: 'Fun mini-Olympics for children ages 6-12 with medals and prizes.',                                        date: fmt(addDays(today,2)), startTime: '10:00', endTime: '12:00', venue: 'Sports Field',             type: 'KIDS_PARTY',         expectedGuests: 80,  status: 'PLANNED',   assignedAnimators: ['u8','u9','u11'] },
  { id: 'ev3', hotelId: 'h1', name: 'International Welcome Party',    description: 'Welcome cocktail party for new arrivals with music, games, and team introductions.',                       date: fmt(addDays(today,1)), startTime: '18:00', endTime: '19:30', venue: 'Pool Terrace',             type: 'WELCOME_PARTY',      expectedGuests: 150, status: 'CONFIRMED', assignedAnimators: ['u1','u2','u5','u13'] },
  { id: 'ev4', hotelId: 'h1', name: 'Beach Volleyball Tournament',    description: 'Guests vs. Animators beach volleyball championship with trophies.',                                        date: fmt(addDays(today,4)), startTime: '16:00', endTime: '18:00', venue: 'Beach Courts',             type: 'SPORTS_TOURNAMENT',  expectedGuests: 60,  status: 'PLANNED',   assignedAnimators: ['u2','u11','u12','u6'] },
  { id: 'ev5', hotelId: 'h1', name: 'Arabic Folklore Night',          description: 'Traditional music, Tanoura dance, and Oriental show.',                                                     date: fmt(addDays(today,5)), startTime: '20:30', endTime: '22:30', venue: 'Amphitheater',             type: 'CULTURAL_SHOW',      expectedGuests: 380, status: 'PLANNED',   assignedAnimators: ['u3','u7','u13','u10'] },
  { id: 'ev6', hotelId: 'h2', name: 'Lagoon Sunset Cruise Party',     description: 'Sunset catamaran cruise with live music, snacks, and diving demos.',                                       date: fmt(addDays(today,2)), startTime: '17:00', endTime: '20:00', venue: 'Lagoon Marina',            type: 'SPECIAL_PERFORMANCE', expectedGuests: 80,  status: 'CONFIRMED', assignedAnimators: ['u20','u21','u25'] },
  { id: 'ev7', hotelId: 'h3', name: 'Azure Sports Day',               description: 'Full-day beach sports festival with volleyball, football, and water polo.',                                date: fmt(addDays(today,3)), startTime: '09:00', endTime: '18:00', venue: 'Azure Beach & Pool',       type: 'SPORTS_TOURNAMENT',  expectedGuests: 200, status: 'PLANNED',   assignedAnimators: ['u30','u31','u32','u33'] },
  { id: 'ev8', hotelId: 'h4', name: 'Coral Reef Farewell Night',      description: 'Special farewell show for departing guests with acrobatics, fire show, and oriental dance.',              date: fmt(addDays(today,1)), startTime: '21:00', endTime: '23:00', venue: 'Beach Terrace',            type: 'FAREWELL_PARTY',     expectedGuests: 120, status: 'CONFIRMED', assignedAnimators: ['u40','u41','u42'] },
]

// Deterministic scores — no Math.random() to avoid hydration mismatch
const SCORE_SEED = [88, 92, 79, 85, 93, 76, 90, 95, 81, 87, 89, 83, 91, 92, 94]
export function getPerformanceScores(hotelId: string): PerformanceScore[] {
  return getHotelAnimators(hotelId).map((a, i) => {
    const base = SCORE_SEED[i % SCORE_SEED.length]
    return {
      animatorId: a.id,
      animatorName: `${a.firstName} ${a.lastName}`,
      period: '2024-W23',
      punctuality: Math.min(100, base + 4),
      attitude: Math.min(100, base + 2),
      skills: Math.max(60, base - 5),
      guestFeedback: Math.min(100, base + 1),
      teamwork: Math.min(100, base + 3),
      overall: a.performance,
    }
  })
}
// Legacy export defaults to h1
export const PERFORMANCE_SCORES: PerformanceScore[] = getPerformanceScores('h1')

// ─── Per-hotel filtered selectors ─────────────────────────────────────────────
export function getHotelAnimators(hotelId: string) {
  return ANIMATORS.filter(a => a.hotelId === hotelId)
}
export function getHotelTeams(hotelId: string) {
  return TEAMS.filter(t => t.hotelId === hotelId)
}
export function getHotelSchedule(hotelId: string) {
  return SCHEDULE_ENTRIES.filter(s => s.hotelId === hotelId)
}
export function getHotelAssignments(hotelId: string) {
  return ASSIGNMENTS.filter(a => a.hotelId === hotelId)
}
export function getHotelAnnouncements(hotelId: string) {
  return ANNOUNCEMENTS.filter(a => a.hotelId === hotelId)
}
export function getHotelLeaveRequests(hotelId: string) {
  return LEAVE_REQUESTS.filter(l => l.hotelId === hotelId)
}
export function getHotelEvents(hotelId: string) {
  return EVENTS.filter(e => e.hotelId === hotelId)
}

// ─── Stats for Dashboard ──────────────────────────────────────────────────────
export function getDashboardStats(hotelId: string) {
  const animators  = getHotelAnimators(hotelId)
  const schedule   = getHotelSchedule(hotelId)
  const leaves     = getHotelLeaveRequests(hotelId)
  const events     = getHotelEvents(hotelId)
  const assignments= getHotelAssignments(hotelId)
  const todayStr   = fmt(today)
  return {
    totalAnimators:      animators.length,
    activeToday:         schedule.filter(s => s.date === todayStr && s.status !== 'CANCELLED').length,
    onLeave:             leaves.filter(l => l.status === 'APPROVED' && l.startDate <= todayStr && l.endDate >= todayStr).length,
    activitiesScheduled: schedule.filter(s => s.date === todayStr).length,
    activitiesCompleted: schedule.filter(s => s.date === todayStr && s.status === 'COMPLETED').length,
    pendingLeaves:       leaves.filter(l => l.status === 'PENDING').length,
    upcomingEvents:      events.filter(e => e.status !== 'COMPLETED' && e.status !== 'CANCELLED').length,
    avgAttendance:       animators.length ? Math.round(animators.reduce((s, a) => s + a.attendanceRate, 0) / animators.length) : 0,
    avgPerformance:      animators.length ? Math.round(animators.reduce((s, a) => s + a.performance,    0) / animators.length) : 0,
    guestFeedbackAvg:    hotelId === 'h1' ? 4.6 : hotelId === 'h2' ? 4.4 : hotelId === 'h3' ? 4.7 : 4.5,
    openAssignments:     assignments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length,
    teams:               getHotelTeams(hotelId).length,
  }
}
// Legacy export for backward compatibility — defaults to h1
export const DASHBOARD_STATS = getDashboardStats('h1')

// Weekly activity data for charts
export const WEEKLY_ACTIVITY_DATA = [
  { day: 'Mon', activities: 14, guests: 280, attendance: 96 },
  { day: 'Tue', activities: 16, guests: 310, attendance: 94 },
  { day: 'Wed', activities: 12, guests: 245, attendance: 98 },
  { day: 'Thu', activities: 18, guests: 360, attendance: 97 },
  { day: 'Fri', activities: 20, guests: 420, attendance: 95 },
  { day: 'Sat', activities: 22, guests: 480, attendance: 99 },
  { day: 'Sun', activities: 15, guests: 300, attendance: 96 },
]

const TEAM_PERF_SEED = [95, 91, 93, 88, 89, 92, 90, 87, 94, 86, 93, 88, 91, 89, 92, 85]
export function getTeamPerformanceData(hotelId: string) {
  return getHotelTeams(hotelId).map((t, i) => ({
    team: t.name,
    performance: TEAM_PERF_SEED[i] ?? 88,
    attendance: Math.min(100, (TEAM_PERF_SEED[i] ?? 88) + 2),
    members: t.memberCount,
  }))
}
// Legacy export defaults to h1
export const TEAM_PERFORMANCE_DATA = getTeamPerformanceData('h1')

export const FEEDBACK_TREND_DATA = [
  { month: 'Jan', rating: 4.2, reviews: 45 },
  { month: 'Feb', rating: 4.4, reviews: 52 },
  { month: 'Mar', rating: 4.3, reviews: 61 },
  { month: 'Apr', rating: 4.5, reviews: 78 },
  { month: 'May', rating: 4.6, reviews: 94 },
  { month: 'Jun', rating: 4.7, reviews: 112 },
]
