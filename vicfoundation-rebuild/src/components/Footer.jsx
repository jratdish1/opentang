import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-offwhite/70">
      {/* CTA Banner */}
      <div className="bg-olive py-10">
        <div className="container-vic text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-offwhite mb-3 tracking-wider">
            Ready to Make a Difference?
          </h3>
          <p className="text-offwhite/80 mb-6 max-w-xl mx-auto font-body">
            Every dollar, every share, every act of support helps a veteran or first responder
            in need. Join the mission today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/donate" className="btn-primary no-underline">
              <Heart size={18} />
              Donate Now
            </Link>
            <Link to="/contact" className="btn-secondary no-underline">
              Get Involved
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-vic section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="font-heading text-navy-dark text-lg font-bold">V</span>
              </div>
              <div>
                <div className="font-heading text-offwhite text-lg tracking-wider">
                  VIC Foundation
                </div>
                <div className="text-gold text-xs tracking-widest uppercase">
                  501(c)(3) Nonprofit
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering veterans, first responders, and their families through community,
              innovation, and direct action. Semper Fi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-gold text-sm tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 list-none">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/programs', label: 'Our Programs' },
                { to: '/donate', label: 'Donate' },
                { to: '/blog', label: 'Blog' },
                { to: '/hero-swap', label: 'HERO Swap' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-gold transition-colors no-underline text-offwhite/70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-gold text-sm tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 list-none">
              <li className="flex items-start gap-2 text-sm">
                <Mail size={16} className="mt-0.5 text-gold shrink-0" />
                <a href="mailto:info@vicfoundation.com" className="hover:text-gold transition-colors no-underline text-offwhite/70">
                  info@vicfoundation.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
                <span>United States</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-gold text-sm tracking-widest mb-4">Stay Connected</h4>
            <p className="text-sm mb-4">
              Get updates on our mission, events, and ways to help.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 bg-navy-light border border-olive/30 text-offwhite placeholder:text-offwhite/40 text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <button type="submit" className="btn-primary text-sm py-2.5 justify-center">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-olive/20">
        <div className="container-vic py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <span>&copy; {currentYear} VIC Foundation. All rights reserved. 501(c)(3) Nonprofit Organization.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold transition-colors no-underline text-offwhite/70">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors no-underline text-offwhite/70">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
