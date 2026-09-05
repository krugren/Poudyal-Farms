"use client";
import Link from 'next/link';
import FooterSilhouette from './FooterSilhouette';
import { LogoIcon, PinIcon, PhoneIcon, MailIcon, InstagramIcon, FacebookIcon, TwitterIcon } from './Icons';

export default function Footer() {
  return (
    /*
     * position: relative  — anchors FooterSilhouette's absolute positioning
     * overflow: visible   — silhouette SVG allowed to exist without clip
     * paddingTop: 200px   — reserves space for the 180px silhouette (180 + 20px gap)
     *                       Applied inline so it overrides the CSS shorthand padding.
     *                       Other pages are unaffected because the silhouette sits
     *                       WITHIN the footer (top: 0), never above page content.
     */
    <footer
      className="footer"
      style={{ position: 'relative', overflow: 'visible', paddingTop: '200px' }}
    >
      <FooterSilhouette />

      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="footer__logo">
              <LogoIcon size={24} />
              <span>Poudhyal Farms</span>
            </Link>
            <p className="footer__desc">
              Experience the authentic charm of Sikkim in our organic farmstay.
              Wake up to Himalayan views, enjoy farm-to-table cuisine, and reconnect with nature.
            </p>
          </div>

          <div>
            <h4 className="footer__heading">Quick Links</h4>
            <nav>
              <Link href="/about"        className="footer__link">About &amp; Travel</Link>
              <Link href="/reservations" className="footer__link">Book a Stay</Link>
              <Link href="/feedback"     className="footer__link">Guest Feedback</Link>
              <Link href="/contact"      className="footer__link">Contact Us</Link>
            </nav>
          </div>

          <div>
            <h4 className="footer__heading">Experiences</h4>
            <nav>
              <Link href="/about#activities" className="footer__link">Organic Farming</Link>
              <Link href="/about#activities" className="footer__link">Tea Garden Walk</Link>
              <Link href="/about#activities" className="footer__link">Bird Watching</Link>
              <Link href="/about#activities" className="footer__link">Local Cuisine</Link>
            </nav>
          </div>

          <div>
            <h4 className="footer__heading">Contact Info</h4>
            <address style={{ fontStyle: 'normal' }}>
              <div className="footer__contact-item">
                <PinIcon size={16} />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Poudhyal+Farms+Rumtek-Ranka+Road+Gangtok+Sikkim+737101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__link"
                >
                  Poudhyal Farms, Rumtek-Ranka Road,<br />Gangtok, Sikkim 737101
                </a>
              </div>
              <div className="footer__contact-item">
                <PhoneIcon size={16} />
                <a href="tel:+919547809775" className="footer__link">+91 95478 09775</a>
              </div>
              <div className="footer__contact-item">
                <MailIcon size={16} />
                <a href="mailto:stay@poudhyalfarms.com" className="footer__link">stay@poudhyalfarms.com</a>
              </div>
            </address>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Poudhyal Farms Sikkim. All rights reserved.</p>
          <div className="footer__socials">
            <a href="https://instagram.com/poudhyalfarms" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Instagram"><InstagramIcon size={18} /></a>
            <a href="https://www.facebook.com/poudhyalfarms"  target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Facebook"><FacebookIcon  size={18} /></a>
            <a href="https://twitter.com/poudhyalfarms"   target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter"><TwitterIcon    size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
