"use client";
import ScrollReveal from '@/components/ScrollReveal';
import Tilt3D from '@/components/Tilt3D';

// ── Theme-matched SVG icon set ─────────────────────────────────────────────
// All monoline, currentColor, strokeWidth 1.5 — matches the Icons.jsx system.
const I = ({ children, size = 28 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Icons keyed to each category
const MountainViewIcon  = () => <I><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="m5 15 3-3 2 2"/></I>;
const OutdoorIcon       = () => <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>;
const KitchenIcon       = () => <I><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"/><path d="M7 21h10"/><path d="M19.5 12 22 6"/><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62"/><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62"/></I>;
const BathroomIcon      = () => <I><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></I>;
const BedroomIcon       = () => <I><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></I>;
const EntertainIcon     = () => <I><rect width="20" height="15" x="2" y="3" rx="2"/><polyline points="8 21 12 17 16 21"/></I>;
const FamilyIcon        = () => <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>;
const WifiIcon          = () => <I><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></I>;
const SafetyIcon        = () => <I><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>;
const FanIcon           = () => <I><circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 0 4 4 4 4 0 0 1 0 8 4 4 0 0 0-4 4 4 4 0 0 1-8 0 4 4 0 0 0-4-4 4 4 0 0 1 0-8 4 4 0 0 0 4-4 4 4 0 0 1 4-4z"/></I>;
const ParkingIcon       = () => <I><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></I>;
const ServicesIcon      = () => <I><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></I>;

// ── Card data ──────────────────────────────────────────────────────────────
const AMENITY_CARDS = [
  {
    Icon: MountainViewIcon,
    title: 'Scenic Views',
    items: ['Mountain view', 'Valley view', 'Private patio & balcony', 'Private back garden'],
  },
  {
    Icon: OutdoorIcon,
    title: 'Outdoors',
    items: ['Outdoor dining area', 'Firepit', 'BBQ grill', 'Free parking on premises'],
  },
  {
    Icon: KitchenIcon,
    title: 'Kitchen & Dining',
    items: ['Breakfast provided', 'Kitchenette', 'Microwave · Oven · Rice cooker', 'Coffee maker', 'Cooking basics & crockery', 'Wine glasses · Dining table'],
  },
  {
    Icon: BathroomIcon,
    title: 'Bathroom',
    items: ['Hot water', 'Shower gel · Shampoo · Conditioner', 'Local herbal body soap', 'Hairdryer · Cleaning products'],
  },
  {
    Icon: BedroomIcon,
    title: 'Bedroom & Laundry',
    items: ['Bed linen', 'Mosquito net', 'Washing machine · Free dryer', 'Hangers', 'Ceiling fan'],
  },
  {
    Icon: EntertainIcon,
    title: 'Entertainment',
    items: ['Table tennis table', 'Exercise equipment', 'TV', 'Books & reading material'],
  },
  {
    Icon: FamilyIcon,
    title: 'Family',
    items: ["Children's playroom", "Toys & books (ages 2–5)", "Children's bikes", "Board games · Baby bath"],
  },
  {
    Icon: WifiIcon,
    title: 'Services & Facilities',
    items: [
      'High-speed WiFi',
      'Dedicated workspace',
      'Host greets you',
      'Luggage drop-off allowed',
      'Long-term stays (28+ days)',
      'Smoking allowed',
      'Fire extinguisher · First aid kit',
    ],
  },
];

const NOT_AVAILABLE = [
  'Air conditioning', 'Central heating', 'Full kitchen',
  'Smoke alarm', 'Carbon monoxide alarm', 'Security cameras',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmenitiesSection() {
  return (
    <section className="section section--alt amenities-section">
      <div className="container">

        {/* Header — matches all other section headers exactly */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="section-label">The Experience</p>
            <h2 className="section-title">What This Place Offers</h2>
            <p className="section-subtitle">
              A thoughtfully equipped farmstay — every comfort considered,
              every detail rooted in the landscape.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards grid — same pattern as activities + highlights sections */}
        <div className="grid-4 amenities-grid">
          {AMENITY_CARDS.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.06}>
              <Tilt3D
                className="card card--glow amenity-card"
                style={{ height: '100%' }}
                strength={8}
              >
                <div className="amenity-card__icon">
                  <card.Icon />
                </div>
                <h3 className="amenity-card__title">{card.title}</h3>
                <ul className="amenity-card__list">
                  {card.items.map(item => (
                    <li key={item} className="amenity-card__item">
                      <span className="amenity-card__tick" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Tilt3D>
            </ScrollReveal>
          ))}
        </div>

        {/* Not available — quiet footnote */}
        <ScrollReveal>
          <div className="amenities-na">
            <span className="amenities-na__label">Not available at this property:</span>
            {' '}{NOT_AVAILABLE.join(' · ')}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
