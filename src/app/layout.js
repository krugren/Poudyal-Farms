import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from './LayoutWrapper';


const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

export const metadata = {
  metadataBase: new URL('https://poudyal-farms.vercel.app'),
  alternates: {
    canonical: 'https://poudyal-farms.vercel.app',
  },
  title: {
    default: 'Poudhyal Farms | Organic Farmstay in Sikkim',
    template: '%s | Poudhyal Farms',
  },
  description: 'Experience authentic Sikkimese farm life at Poudhyal Farms. A premium organic farmstay with panoramic Kanchenjunga views, nestled in the hills of Gangtok, Sikkim.',
  keywords: ['farmstay', 'Sikkim', 'organic farm', 'Gangtok', 'homestay', 'Kanchenjunga', 'Poudhyal Farms', 'eco tourism', 'Northeast India'],
  openGraph: {
    title: 'Poudhyal Farms | Organic Farmstay in Sikkim',
    description: 'A sanctuary of peace, organic living, and traditional hospitality amidst the misty mountains of Gangtok.',
    url: 'https://poudyal-farms.vercel.app',
    siteName: 'Poudhyal Farms',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/uploads/gallery/pf-20260702-11.jpeg',
        width: 1200,
        height: 900,
        alt: 'Poudhyal Farms — A-frame farmhouse surrounded by lush Himalayan greenery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poudhyal Farms | Organic Farmstay in Sikkim',
    description: 'A sanctuary of peace, organic living, and traditional hospitality amidst the misty mountains of Gangtok.',
    images: ['/uploads/gallery/pf-20260702-11.jpeg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Schema.org structured data — tells Google this is a LodgingBusiness.
// Unlocks rich search results: star ratings, price range, address snippet.
const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Poudhyal Farms',
  description: 'Premium organic farmstay with panoramic Kanchenjunga views in Gangtok, Sikkim. Three-generation family farm offering authentic Sikkimese hospitality.',
  url: 'https://poudyal-farms.vercel.app',
  image: 'https://poudyal-farms.vercel.app/uploads/gallery/pf-20260702-11.jpeg',
  telephone: '+91 95478 09775',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gangtok',
    addressRegion: 'Sikkim',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 27.3389,
    longitude: 88.6065,
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Mountain View',          value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Valley View',            value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Organic Breakfast',      value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Free Parking',           value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'WiFi',                   value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Private Patio/Balcony',  value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'BBQ Grill',              value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Firepit',                value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Outdoor Dining Area',    value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Table Tennis',           value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Children Playroom',      value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Washing Machine',        value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Kitchenette',            value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Hot Water',              value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Long-term Stays Allowed',value: true  },
    { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning',       value: false },
    { '@type': 'LocationFeatureSpecification', name: 'Smoke Alarm',            value: false },
  ],
  sameAs: [
    'https://poudyal-farms.vercel.app',
    'https://www.airbnb.co.in/rooms/1384121204022057341',
  ],
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
