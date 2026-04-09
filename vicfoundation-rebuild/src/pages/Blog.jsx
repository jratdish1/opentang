/*
 * VIC FOUNDATION — BLOG PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 */
import { useState } from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Veterans', 'Crypto', 'Programs', 'Community', 'News'];

const POSTS = [
  {
    id: 1,
    title: 'How $HERO Token Is Changing Charitable Giving Forever',
    excerpt: 'Traditional charities take weeks to process donations and skim overhead. The $HERO protocol changes everything with on-chain transparency and instant impact.',
    date: '2026-04-01',
    author: 'VIC Foundation',
    category: 'Crypto',
    featured: true,
  },
  {
    id: 2,
    title: 'Veteran Spotlight: From Combat to Code — Marcus\'s Journey',
    excerpt: 'After 12 years in the Marine Corps, SSgt. Marcus R. transitioned to a career in blockchain development with help from VIC Foundation\'s education program.',
    date: '2026-03-25',
    author: 'VIC Foundation',
    category: 'Veterans',
    featured: false,
  },
  {
    id: 3,
    title: 'What Is Decentralized Fundraising and Why It Matters for Veterans',
    excerpt: 'Decentralized fundraising removes middlemen, reduces overhead, and puts donors in direct control. Here\'s how it benefits military veterans and first responders.',
    date: '2026-03-18',
    author: 'VIC Foundation',
    category: 'Crypto',
    featured: false,
  },
  {
    id: 4,
    title: 'Purpose-Driven Tokens: What They Mean for Charitable Impact',
    excerpt: 'Not all tokens are created equal. Purpose-driven tokens like $HERO are designed from the ground up to fund real-world charitable initiatives with every transaction.',
    date: '2026-03-10',
    author: 'VIC Foundation',
    category: 'Crypto',
    featured: false,
  },
  {
    id: 5,
    title: 'Community-Driven Tokens and Organic Growth in Charitable Efforts',
    excerpt: 'When a community rallies behind a cause, organic growth follows. Learn how community-driven tokens create sustainable funding for charitable organizations.',
    date: '2026-03-05',
    author: 'VIC Foundation',
    category: 'Community',
    featured: false,
  },
  {
    id: 6,
    title: 'Spring 2026 Programs Update: What\'s New at VIC Foundation',
    excerpt: 'New partnerships, expanded programs, and more ways to support veterans. Here\'s everything happening at VIC Foundation this spring.',
    date: '2026-02-28',
    author: 'VIC Foundation',
    category: 'Programs',
    featured: false,
  },
  {
    id: 7,
    title: 'Effective Ways to Utilize Fiat for Fundraising in 2025-2026',
    excerpt: 'While crypto is the future, fiat fundraising remains essential. Here are proven strategies for maximizing traditional fundraising alongside blockchain innovation.',
    date: '2026-02-20',
    author: 'VIC Foundation',
    category: 'News',
    featured: false,
  },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter((p) => p.category === activeCategory);

  const featured = POSTS.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || activeCategory !== 'All');

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">Blog</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Latest <span className="text-gold">Intel</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            News, stories, and insights from the VIC Foundation community.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-offwhite border-b border-warm-gray sticky top-18 md:top-20 z-30">
        <div className="container-vic py-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 font-heading text-xs tracking-widest uppercase whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-navy text-offwhite'
                  : 'bg-warm-gray text-text-muted hover:bg-navy/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {activeCategory === 'All' && featured && (
        <section className="section-padding bg-offwhite pb-0">
          <div className="container-vic">
            <div className="bg-navy p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-crimson text-offwhite font-heading text-xs tracking-widest uppercase">
                  Featured
                </span>
                <span className="px-3 py-1 bg-olive/30 text-offwhite font-heading text-xs tracking-widest uppercase">
                  {featured.category}
                </span>
              </div>
              <h2 className="font-heading text-2xl md:text-4xl text-offwhite tracking-wider mb-4">
                {featured.title}
              </h2>
              <p className="text-offwhite/70 text-lg leading-relaxed mb-6 max-w-3xl font-body">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-6 text-offwhite/50 text-sm font-body">
                <span className="flex items-center gap-2"><Calendar size={14} /> {featured.date}</span>
                <span className="flex items-center gap-2"><User size={14} /> {featured.author}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(({ id, title, excerpt, date, author, category }) => (
              <article
                key={id}
                className="bg-white border-l-4 border-gold hover:border-crimson transition-all duration-300 hover:shadow-lg group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={12} className="text-olive" />
                    <span className="font-heading text-olive text-xs tracking-widest uppercase">{category}</span>
                  </div>
                  <h3 className="font-heading text-navy-dark text-lg tracking-wider mb-3 group-hover:text-crimson transition-colors leading-tight">
                    {title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-4 font-body">{excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-text-muted text-xs font-body">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-gold font-heading text-xs tracking-wider uppercase group-hover:text-crimson transition-colors">
                      Read <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted font-body">No posts in this category yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
