/*
 * VIC FOUNDATION — PROGRAMS PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 */
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, BookOpen, Briefcase, Home as HomeIcon, Stethoscope, ArrowRight } from 'lucide-react';

const PROGRAMS = [
  {
    icon: <Shield size={36} />,
    title: 'Emergency Financial Relief',
    desc: 'When crisis strikes, we respond within 48 hours. Emergency grants cover housing, utilities, medical bills, and immediate needs for veterans and first responders facing unexpected hardship.',
    features: ['48-hour response time', 'No repayment required', 'Direct bank transfer or crypto', 'Case-by-case assessment'],
    color: 'border-crimson',
  },
  {
    icon: <HomeIcon size={36} />,
    title: 'Housing Assistance',
    desc: 'Homelessness among veterans is unacceptable. We provide transitional housing support, rent assistance, and connections to permanent housing solutions.',
    features: ['Rent & mortgage assistance', 'Transitional housing placement', 'Utility bill support', 'Housing counselor referrals'],
    color: 'border-olive',
  },
  {
    icon: <Stethoscope size={36} />,
    title: 'Mental Health & Wellness',
    desc: 'PTSD, TBI, and the invisible wounds of service affect millions. We fund counseling, therapy sessions, and wellness programs tailored to service members.',
    features: ['Licensed therapist referrals', 'Group therapy sessions', 'Wellness retreats', 'Crisis hotline support'],
    color: 'border-gold',
  },
  {
    icon: <BookOpen size={36} />,
    title: 'Education & Blockchain Literacy',
    desc: 'Preparing veterans for the future economy. Scholarships, coding bootcamps, and Web3 education to help service members transition into high-growth careers.',
    features: ['Scholarship grants', 'Blockchain & DeFi courses', 'Career mentorship', 'Certification funding'],
    color: 'border-navy',
  },
  {
    icon: <Briefcase size={36} />,
    title: 'Career Transition Support',
    desc: 'Military skills translate to civilian success — but the path isn\'t always clear. We provide resume building, interview prep, and employer connections.',
    features: ['Resume & LinkedIn optimization', 'Mock interviews', 'Employer network access', 'Entrepreneurship support'],
    color: 'border-crimson',
  },
  {
    icon: <Users size={36} />,
    title: 'Community & Events',
    desc: 'Connection is everything. Regular meetups, online communities, and annual events bring veterans and supporters together to share, learn, and grow.',
    features: ['Monthly virtual meetups', 'Annual in-person events', 'Telegram & Discord communities', 'Mentorship matching'],
    color: 'border-olive',
  },
];

export default function Programs() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">Our Programs</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Direct <span className="text-gold">Action</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            Every program is designed to meet veterans and first responders where they are —
            with urgency, dignity, and zero bureaucracy.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map(({ icon, title, desc, features, color }) => (
              <div key={title} className={`bg-white p-8 border-t-4 ${color} hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-olive mb-4">{icon}</div>
                <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-3">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-4 font-body">{desc}</p>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-dark/70 font-body">
                      <div className="w-1.5 h-1.5 bg-gold mt-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-navy">
        <div className="container-vic">
          <h2 className="font-heading text-2xl md:text-3xl text-offwhite text-center mb-12 tracking-wider heading-accent heading-accent-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Apply', desc: 'Submit a request through our secure online form or contact us directly.' },
              { step: '02', title: 'Review', desc: 'Our team reviews each case individually within 24 hours.' },
              { step: '03', title: 'Approve', desc: 'Approved requests are funded via direct transfer or crypto within 48 hours.' },
              { step: '04', title: 'Follow Up', desc: 'We stay connected to ensure ongoing support and community integration.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="font-heading text-gold text-4xl mb-3">{step}</div>
                <h3 className="font-heading text-offwhite text-lg tracking-wider mb-2">{title}</h3>
                <p className="text-offwhite/60 text-sm font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-olive">
        <div className="container-vic text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-offwhite mb-4 tracking-wider">
            Need Help? We're Here.
          </h2>
          <p className="text-offwhite/80 max-w-xl mx-auto mb-8 font-body">
            If you're a veteran or first responder in need, don't hesitate. Reach out today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary no-underline">
              Request Assistance
            </Link>
            <Link to="/donate" className="btn-crimson no-underline">
              <Heart size={18} /> Fund a Program
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
