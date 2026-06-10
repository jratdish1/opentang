import { useState } from "react";
import { valor1775Products, valor1775Stats } from "@/lib/valor1775Data";
import { Valor1775Waitlist } from "@/components/Valor1775Waitlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, ChevronDown, ChevronUp, Mail } from "lucide-react";

function ProductCard({ product }: { product: (typeof valor1775Products)[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="group overflow-hidden bg-gray-900 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={`Valor 1775 ${product.name} — ${product.dosage} — For Research Use Only`}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-yellow-500 text-black font-bold text-sm px-3 py-1">
            ${product.price.toFixed(2)}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-black/70 text-gray-300 border-gray-600 text-xs">
            {product.dosage}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Product Name & Tagline */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-white tracking-wide mb-1">
            {product.name}
          </h3>
          <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">
            {product.tagline}
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
          {product.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
              <Shield className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              <span>{benefit.label}</span>
            </div>
          ))}
        </div>

        {/* Expandable Description */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Less info" : "Research summary"}
        </button>

        {expanded && (
          <p className="text-gray-400 text-xs leading-relaxed mb-4 border-t border-gray-700 pt-3">
            {product.description}
          </p>
        )}

        {/* Disclaimer */}
        <p className="text-gray-600 text-xs italic border-t border-gray-800 pt-3">
          {product.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Valor1775() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Nav */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-black fill-black" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-wider">VALOR</span>
              <span className="font-black text-yellow-500 text-lg"> 1775</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-gray-500 text-xs tracking-widest uppercase">
              Strength. Purpose. Honor.
            </span>
            <Button
              size="sm"
              onClick={() => setShowWaitlist(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black to-black" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">
              Semper Fidelis
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-white">VALOR</span>
            <span className="text-yellow-500"> 1775</span>
          </h1>
          <p className="text-xl text-gray-400 mb-2 tracking-widest uppercase font-light">
            Strength. Purpose. Honor.
          </p>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto mb-8">
            Premium research peptides and compounds. All products are for research use only
            and not intended for human consumption. Est. 1775 — Semper Fidelis.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {[
              { label: "Products", value: "8" },
              { label: "Price Each", value: "$99.99" },
              { label: "Quality", value: "Premium" },
              { label: "Purpose", value: "Research" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-yellow-500">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8"
            >
              View Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowWaitlist(true)}
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-bold px-8"
            >
              <Mail className="w-4 h-4 mr-2" />
              Join Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Research Disclaimer Banner */}
      <div className="bg-yellow-500/10 border-y border-yellow-500/20 py-3 px-4">
        <p className="text-center text-yellow-400/80 text-xs font-medium tracking-wider uppercase">
          ⚠ All products are for research use only — not for human consumption — not intended to diagnose, treat, cure, or prevent any disease
        </p>
      </div>

      {/* Products Grid */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Research Catalog
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {valor1775Stats.products} premium compounds. All at ${valor1775Stats.price.replace("$", "")} each.
              For research purposes only.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {valor1775Products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-3">
            Stay in the Fight
          </h2>
          <p className="text-gray-400 mb-6">
            Join the Valor 1775 waitlist for early access, exclusive research updates,
            and priority notifications when new compounds become available.
          </p>
          <Button
            size="lg"
            onClick={() => setShowWaitlist(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10"
          >
            <Mail className="w-4 h-4 mr-2" />
            Join Waitlist — Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-black fill-black" />
            </div>
            <span className="font-black text-white">VALOR</span>
            <span className="font-black text-yellow-500">1775</span>
          </div>
          <p className="text-gray-600 text-xs mb-2">
            Strength. Purpose. Honor. — Est. 1775 — Semper Fidelis
          </p>
          <p className="text-gray-700 text-xs max-w-2xl mx-auto">
            All products listed on this site are for research use only and are not intended for human
            consumption. These statements have not been evaluated by the Food and Drug Administration.
            These products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowWaitlist(false)}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm"
            >
              ✕ Close
            </button>
            <Valor1775Waitlist onClose={() => setShowWaitlist(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
