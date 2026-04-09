/*
 * VIC FOUNDATION — CONTACT PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 */
import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">Contact</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Get In <span className="text-gold">Touch</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            Whether you need help, want to volunteer, or have questions — we're here.
            Reach out and we'll respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form — 2 cols */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 shadow-sm">
                <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-6">
                  Send Us a Message
                </h3>

                {submitted ? (
                  <div className="bg-olive/10 border border-olive/30 p-8 text-center">
                    <div className="text-olive text-4xl mb-3">✓</div>
                    <h4 className="font-heading text-navy-dark text-lg tracking-wider mb-2">Message Sent</h4>
                    <p className="text-text-muted font-body">Thank you for reaching out. We'll respond within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select Subject</option>
                      <option value="assistance">Request Assistance</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="donate">Donation Question</option>
                      <option value="partnership">Partnership / Sponsorship</option>
                      <option value="media">Media Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea
                      placeholder="Your Message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                    <button type="submit" className="btn-crimson w-full justify-center text-lg py-4">
                      <Send size={18} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-navy p-6">
                <h4 className="font-heading text-gold text-sm tracking-widest mb-4 uppercase">Contact Info</h4>
                <ul className="space-y-4 list-none">
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <div className="text-offwhite text-sm font-body">Email</div>
                      <a href="mailto:info@vicfoundation.com" className="text-gold text-sm hover:text-gold-light transition-colors no-underline font-body">
                        info@vicfoundation.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin size={18} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <div className="text-offwhite text-sm font-body">Location</div>
                      <span className="text-offwhite/60 text-sm font-body">United States</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <div className="text-offwhite text-sm font-body">Telegram</div>
                      <a href="https://t.me/vetsincrypto" target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:text-gold-light transition-colors no-underline font-body">
                        @vetsincrypto
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-olive p-6">
                <h4 className="font-heading text-offwhite text-sm tracking-widest mb-3 uppercase">
                  Need Immediate Help?
                </h4>
                <p className="text-offwhite/80 text-sm mb-4 font-body">
                  If you're a veteran or first responder in crisis, please reach out immediately.
                  We respond to emergency requests within 48 hours.
                </p>
                <a href="mailto:info@vicfoundation.com?subject=Emergency%20Assistance%20Request" className="btn-primary text-xs py-2 px-4 no-underline">
                  Emergency Request
                </a>
              </div>

              <div className="bg-warm-gray p-6">
                <h4 className="font-heading text-navy-dark text-sm tracking-widest mb-3 uppercase">
                  Response Time
                </h4>
                <p className="text-text-muted text-sm font-body">
                  General inquiries: 24 hours. Emergency requests: 48 hours. Partnership inquiries: 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
