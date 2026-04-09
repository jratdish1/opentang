import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/donate', label: 'Donate' },
  { to: '/blog', label: 'Blog' },
  { to: '/hero-swap', label: 'HERO Swap' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-vic flex items-center justify-between h-18 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
            <span className="font-heading text-navy-dark text-lg font-bold">V</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-heading text-offwhite text-lg tracking-wider leading-tight">
              VIC Foundation
            </div>
            <div className="text-gold text-xs tracking-widest uppercase">
              Honor Through Action
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 font-heading text-sm tracking-wider uppercase no-underline transition-colors ${
                location.pathname === to
                  ? 'text-gold'
                  : 'text-offwhite/80 hover:text-gold'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/donate"
            className="btn-crimson ml-3 text-sm py-2 px-4 no-underline flex items-center gap-2"
          >
            <Heart size={16} />
            Donate Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-offwhite p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy-dark/98 backdrop-blur-md border-t border-olive/20">
          <div className="container-vic py-4 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-3 font-heading text-sm tracking-wider uppercase no-underline transition-colors ${
                  location.pathname === to
                    ? 'text-gold bg-navy-light/50'
                    : 'text-offwhite/80 hover:text-gold hover:bg-navy-light/30'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/donate"
              className="btn-crimson mt-3 w-full justify-center no-underline"
            >
              <Heart size={16} />
              Donate Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
