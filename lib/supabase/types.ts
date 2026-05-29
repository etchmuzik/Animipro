// ─── Animipro — Supabase database types ──────────────────────────────────────
//
// TEMPORARY hand-written bridge. Once you create the real Supabase project and
// apply the migrations, regenerate this file with:
//
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
//
// That gives exact, column-level type safety. Until then this faithful subset
// (the tables the app queries in Phase 0/1) keeps everything typed + compiling.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Reused literal unions (mirror the SQL enums in supabase/migrations).
export type TicketStatusDB = 'ACTIVE' | 'SCANNED' | 'REFUNDED'
export type PaymentMethodDB = 'CASH' | 'CARD' | 'ROOM_CHARGE' | 'WALLET'
export type PaymentStatusDB = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type UserRoleDB =
  | 'SUPER_ADMIN' | 'HOTEL_ADMIN' | 'ANIMATION_CHIEF' | 'TEAM_LEADER'
  | 'ANIMATOR' | 'ENTERTAINER' | 'LIFEGUARD' | 'KIDS_CLUB' | 'DOOR_SCANNER' | 'GUEST'

type Timestamps = { created_at: string; updated_at: string }

// Generic helper: a table with Row/Insert/Update shapes. Insert/Update make
// server-defaulted columns optional.
interface TableShape<Row> {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<{
        id: string
        company_id: string | null
        hotel_id: string | null
        team_id: string | null
        full_name: string
        initials: string
        role: UserRoleDB
        phone: string | null
        avatar: string | null
      } & Timestamps>

      hotels: TableShape<{
        id: string
        company_id: string
        name: string
        city: string
        stars: number
        address: string
        contact_email: string
        tripadvisor_rating: number | null
        tripadvisor_reviews: number | null
        tripadvisor_rank: string | null
        tripadvisor_badge: string | null
        tripadvisor_trend: string | null
        google_rating: number | null
        booking_rating: number | null
      } & Timestamps>

      clubs: TableShape<{
        id: string
        name: string
        city: string
        area: string | null
        mood: 'BEACH' | 'NIGHTCLUB' | 'LOUNGE' | 'OPEN_AIR' | 'CULTURAL'
        capacity: number | null
        gradient: string | null
        image: string | null
        tagline: string | null
        price_from: number | null
        min_age: number | null
      } & Timestamps>

      club_nights: TableShape<{
        id: string
        club_id: string
        night_date: string
        doors_open: string | null
        doors_close: string | null
        theme: string | null
        price_per_ticket: number
        capacity: number | null
        hotel_allocation: number | null
      } & Timestamps>

      payments: TableShape<{
        id: string
        hotel_id: string
        amount: number
        currency: string
        method: PaymentMethodDB
        status: PaymentStatusDB
        provider: string | null
        provider_order_id: string | null
        provider_txn_id: string | null
        platform_fee: number
        net_to_hotel: number
      } & Timestamps>

      tickets: TableShape<{
        id: string
        qr_id: string
        signature: string
        club_night_id: string
        hotel_id: string
        payment_id: string | null
        guest_name: string
        guest_room: string | null
        guest_count: number
        price_paid: number
        payment_method: PaymentMethodDB
        seller_user_id: string | null
        seller_name: string | null
        status: TicketStatusDB
        sold_at: string
        scanned_at: string | null
        scanned_by_id: string | null
        scanned_by_name: string | null
        refunded_at: string | null
        refund_reason: string | null
      } & Timestamps>

      feedback: TableShape<{
        id: string
        hotel_id: string
        activity_id: string | null
        rating: number
        comment: string | null
        guest_name: string | null
        created_at: string
      }>

      applications: TableShape<{
        id: string
        hotel_id: string | null
        full_name: string
        email: string | null
        phone: string | null
        role: string | null
        nationality: string | null
        languages: string[]
        experience: string | null
        cv_path: string | null
        status: string
        notes: string | null
      } & Timestamps>
    }
    Views: Record<string, never>
    Functions: {
      current_hotel_id: { Args: Record<string, never>; Returns: string }
      current_role: { Args: Record<string, never>; Returns: UserRoleDB }
      current_level: { Args: Record<string, never>; Returns: number }
      is_super_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRoleDB
      ticket_status: TicketStatusDB
      payment_method: PaymentMethodDB
      payment_status: PaymentStatusDB
    }
  }
}
