// ─── Animipro — English message catalog (source of truth) ────────────────────
//
// `en` defines the canonical shape. The Messages type is inferred from it, so
// the other locales (ar/ru/it) are checked structurally and a catalog-parity
// test asserts they carry the same keys. Keep keys grouped by surface area.
//
// Translated surface (this pass): shared chrome (nav, sidebar, topbar) and the
// marketing site (homepage + careers). Platform module bodies remain English.

export const en = {
  common: {
    liveDemo: 'Live Demo',
    buyNow: 'Buy Now',
    backToWebsite: 'Back to website',
    home: 'Home',
    learnMore: 'Learn more',
    loading: 'Loading…',
    close: 'Close',
    demoOnly: 'Demo only',
  },

  nav: {
    forAnimators: 'For Animators',
    forGuests: 'For Guests',
    features: 'Features',
    pricing: 'Pricing',
    careers: 'Careers',
    partners: 'Partners',
    contact: 'Contact',
    testimonials: 'Testimonials',
    language: 'Language',
  },

  // Platform left sidebar + topbar section titles
  sections: {
    dashboard: 'Dashboard',
    team: 'Team',
    schedule: 'Schedule',
    activities: 'Activities',
    assignments: 'Assignments',
    events: 'Events',
    announcements: 'Announcements',
    leave: 'Leave Requests',
    recruitment: 'Recruitment',
    tickets: 'Club Tickets',
    reports: 'Reports',
    performance: 'Performance',
    settings: 'Settings',
  },
  sectionSubtitles: {
    dashboard: "Here's your resort overview",
    team: 'Animators, roles and contracts',
    schedule: 'Weekly activity scheduling',
    activities: 'Activity catalog and programs',
    assignments: 'Task management and delegation',
    events: 'Shows, parties and performances',
    announcements: 'Team communications and notices',
    leave: 'Time-off and absence requests',
    recruitment: 'Applications and hiring',
    tickets: 'Sell and validate guest tickets',
    reports: 'Performance metrics and insights',
    performance: 'KPI tracking and evaluations',
    settings: 'Hotel configuration and preferences',
  },

  mobileNav: {
    home: 'Home',
    schedule: 'Schedule',
    activities: 'Activities',
    tasks: 'Tasks',
    news: 'News',
    more: 'More',
  },

  topbar: {
    search: 'Search…',
    searchAnything: 'Search anything…',
    notifications: 'Notifications',
    switchUser: 'Switch Role / User',
    switchHint: 'Switching roles filters navigation and access levels.',
  },

  sidebar: {
    tagline: 'Resort Management',
    activeProperty: 'Active Property',
    switchProperty: 'Switch Property',
    properties: 'properties',
    hotelsAcross: '{count} hotels across {companies} companies',
  },

  notifications: {
    title: 'Notifications',
    empty: 'You are all caught up',
    markAllRead: 'Mark all read',
    viewAll: 'View all',
    newApplications: '{count} new job application(s)',
    pendingLeave: '{count} leave request(s) awaiting review',
    upcomingActivity: 'Upcoming: {name} at {time}',
    recentAnnouncement: 'Announcement: {title}',
  },

  hero: {
    badge: 'Live across {count} Red Sea resorts right now',
    titleLead: 'Built so your guests',
    titleAccent: 'leave 5-star reviews.',
    subtitle:
      'Animipro is the operations platform for Egyptian resort animation teams. Schedule every activity, capture proof it actually happened, and watch your TripAdvisor score climb, across all your hotels.',
    ctaPrimary: 'Own it forever, from {price}',
    ctaSecondary: 'Open the live platform',
    proof: '{count} animators on shift across Sharm, Hurghada, El Gouna & 5 more destinations.',
    demoLive: 'This card is live. Tap {action} and try it.',
    demoStart: 'Start',
  },

  careers: {
    nowHiring: 'Now hiring for the summer season',
    titleLead: 'Work the best summer',
    titleAccent: 'of your life.',
    intro:
      "Join the animation teams at Egypt's top Red Sea resorts. Run the shows, make guests' holidays unforgettable, and live where everyone else comes to relax.",
    applyNow: 'Apply now',
    seeRoles: 'See open roles',
    perkFlights: 'Flights & visa support',
    perkAccommodation: 'Accommodation + full board',
    perkGrowth: 'Grow into team leader',
    perkRedSea: 'Live by the Red Sea',
    rolesKicker: 'Open roles',
    rolesTitle: 'Find your stage.',
    rolesIntro: 'Whatever your talent, there is a spot on the team. Pick a role to start your application.',
    applyForRole: 'Apply for this role',
    applicationKicker: 'Application',
    applicationTitle: 'Send your application',
    applicationIntro: 'It takes two minutes. We read every single one.',
    hiringAcross: 'Hiring across Sharm El Sheikh, Hurghada, El Gouna, Marsa Alam, Dahab & more.',
    // Roles
    roleAnimator: 'Animator',
    roleAnimatorBlurb: 'Run pool games, beach sports, aqua gym and daytime activities that make guests remember their holiday.',
    roleEntertainer: 'Entertainer',
    roleEntertainerBlurb: 'DJ, host or perform the evening shows. Own the main stage and bring the night to life.',
    roleKids: 'Kids Club',
    roleKidsBlurb: 'Lead the mini club: crafts, mini disco and games. Be the reason kids beg to come back next summer.',
    roleLifeguard: 'Lifeguard',
    roleLifeguardBlurb: 'Keep the pool and beach safe. Calm, certified and watchful while everyone else relaxes.',
    // Form
    formFirst: 'First name',
    formLast: 'Last name',
    formEmail: 'Email',
    formPhone: 'WhatsApp / Phone',
    formNationality: 'Nationality',
    formRole: 'Applying for',
    formLanguages: 'Languages',
    formExperience: 'Years of experience',
    formSpecialties: 'Specialties',
    formPitch: 'Tell us about yourself',
    formPitchPlaceholder: 'Where have you worked, what do you love about animation, and why you?',
    formCv: 'CV / intro video or photo (optional)',
    formCvAttach: 'Attach a PDF, photo or short video',
    formSubmit: 'Submit application',
    formSubmitting: 'Submitting…',
    formDemoNote: 'This is a demo. Applications are stored locally in your browser for the Animipro recruitment screen.',
    formError: 'Something went wrong saving your application. Please try again.',
    successTitle: 'Application received',
    successBody: 'Thanks, {name}. Our hiring team will review your application and reach out by email or WhatsApp. Good luck!',
    successAgain: 'Submit another application',
    successHome: 'Back to home',
    required: 'required',
  },

  footer: {
    hiring: "We're hiring",
    partners: 'Become a partner',
    builtFor: 'Built for Egyptian resort hotels: Sharm El Sheikh, Hurghada, El Gouna, Marsa Alam, Dahab, Ain Sokhna, Taba & more',
    rights: 'All rights reserved.',
  },

  partners: {
    kicker: 'Reseller programme',
    titleLead: 'Run Animipro',
    titleAccent: 'under your brand.',
    intro:
      'Agencies, hotel-group operators and country-level resellers: ship Animipro to your clients as your own product. We provide the platform and the support. You own the relationship.',
    applyAsPartner: 'Apply to join',
    seeTiers: 'See partner tiers',
    tiersKicker: 'Partner tiers',
    tiersTitle: 'Three ways to partner.',
    tiersIntro: 'Pick the scope that matches how you sell. All tiers include the live re-theme and full feature set.',
    pickThisTier: 'Apply for this tier',
    // Tier copy
    studioName: 'Studio Partner',
    studioPrice: '150,000',
    studioPriceSub: 'EGP one-off + recurring',
    studioBlurb: 'For agencies running marketing or IT for a handful of resorts. Up to 10 client hotels under your brand.',
    studioFeatures: 'Up to 10 hotels · 15% revshare OR 1,000 EGP/mo per hotel · Co-marketing kit · Your logo & domain',
    countryName: 'Country Partner',
    countryPrice: '400,000',
    countryPriceSub: 'EGP one-off + recurring',
    countryBlurb: 'Exclusive rights in one country. Right of first refusal on inbound leads, featured on our site as the local partner.',
    countryFeatures: 'Unlimited hotels in 1 country · 10% revshare OR 750 EGP/mo per hotel · First-refusal on leads · Featured listing',
    sourceName: 'Source Licence',
    sourcePrice: '750,000',
    sourcePriceSub: 'EGP one-off, no recurring',
    sourceBlurb: 'The exit ramp. Full source code, perpetual, unlimited rebranding and resale. No revenue share.',
    sourceFeatures: 'Full source code · Unlimited resale · Perpetual licence · No revshare or per-hotel fees',
    applicationKicker: 'Application',
    applicationTitle: 'Tell us about your business',
    applicationIntro: 'A real human reads every application. Expect a reply within two business days.',
    // Form
    formCompany: 'Company / agency name',
    formContact: 'Your name',
    formEmail: 'Email',
    formPhone: 'WhatsApp / Phone',
    formCountry: 'Country',
    formHotelsServed: 'Hotels you serve today',
    formTier: 'Partner tier you are interested in',
    formPitch: 'How would you sell Animipro?',
    formPitchPlaceholder: 'Tell us about your current clients, your pitch, and why Animipro fits.',
    formWebsite: 'Website (optional)',
    formSubmit: 'Submit application',
    formSubmitting: 'Submitting…',
    formDemoNote: 'This is a demo. Submissions are stored locally in your browser.',
    formError: 'Something went wrong saving your application. Please try again.',
    successTitle: 'Application received',
    successBody: 'Thanks, {name}. Our deal team will review your application and reach out within two business days.',
    successAgain: 'Submit another application',
    successHome: 'Back to home',
  },
  // ─── Public guest surface (/guest/[hotelId]) ────────────────────────────────
  guest: {
    picker: {
      eyebrow: 'Guest access',
      title: 'Choose your hotel',
      subtitle: 'Pick where you\'re staying to see today\'s activities and tonight\'s club nights.',
    },
    shell: {
      eyebrow: 'Guest concierge',
      changeHotel: 'Change hotel',
      sections: 'Guest sections',
    },
    tabs: {
      today: 'Today',
      clubs: 'Club nights',
      tickets: 'My tickets',
    },
    today: {
      heading: 'What\'s on today',
      empty: {
        title: 'Quiet day',
        body: 'No activities scheduled for today. Check back tomorrow.',
      },
    },
    clubs: {
      heading: 'Upcoming club nights',
      dateLabel: 'Date',
      doorsLabel: 'Doors',
      priceLabel: 'Price',
      buyCta: 'Buy ticket',
      empty: {
        title: 'No upcoming nights',
        body: 'The clubs are quiet this week. New dates will appear here.',
      },
    },
    buy: {
      title: 'Buy ticket',
      close: 'Close',
      nameLabel: 'Full name',
      namePlaceholder: 'As shown on your passport',
      roomLabel: 'Room number',
      countLabel: 'Guests',
      payLabel: 'Payment',
      pay: {
        card:   'Card',
        wallet: 'Wallet',
        cash:   'Cash',
        room:   'Room charge',
      },
      totalLabel: 'Total',
      confirmCta: 'Confirm purchase',
      processing: 'Processing…',
      confirmedTitle: 'You\'re in.',
      confirmedSubtitle: 'Show this QR at the door.',
      screenshotHint: 'Screenshot this for safekeeping.',
      viewTickets: 'View my tickets',
      done: 'Done',
      simNotice: 'Demo only. No real payment is processed.',
      roomPlaceholder: 'e.g. 412',
    },
    tickets: {
      heading: 'My tickets',
      empty: {
        title: 'No tickets yet',
        body: 'Buy a club ticket and it\'ll appear here with a QR code.',
        cta: 'Browse club nights',
      },
    },
    footer: {
      poweredBy: 'Powered by',
    },
  },
} as const

// Same nested shape as `en`, but with every leaf widened to `string` so the
// other locales can supply their own text while still being required to provide
// exactly the same keys (missing/extra keys are compile errors).
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type Messages = DeepStringify<typeof en>
