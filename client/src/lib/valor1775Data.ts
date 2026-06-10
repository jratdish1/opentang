// Valor 1775 — Official Product Catalog
// All products: For Research Use Only. Not for Human Consumption.
// Only products with verified images and summaries are included.

export interface Valor1775Product {
  id: string;
  name: string;
  tagline: string;
  dosage: string;
  price: number;
  image: string;
  benefits: { icon: string; label: string }[];
  description: string;
  disclaimer: string;
  color: string; // accent color matching product image theme
}

export const valor1775Products: Valor1775Product[] = [
  {
    id: "cjc-1295",
    name: "CJC-1295",
    tagline: "Growth. Rejuvenate. Optimize.",
    dosage: "5MG",
    price: 99.99,
    image: "/manus-storage/cjc-1295_a2dd751a.jpeg",
    benefits: [
      { icon: "shield-plus", label: "Supports Growth Hormone Production*" },
      { icon: "trending-up", label: "Supports Recovery & Regeneration*" },
      { icon: "dumbbell", label: "Supports Lean Muscle Development*" },
    ],
    description:
      "CJC-1295 is a synthetic analog of growth hormone-releasing hormone (GHRH). Research suggests it may support sustained increases in growth hormone and IGF-1 levels, promoting recovery, regeneration, and lean body composition.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "teal",
  },
  {
    id: "nad-plus",
    name: "NAD+",
    tagline: "Energize. Restore. Rejuvenate.",
    dosage: "250MG",
    price: 99.99,
    image: "/manus-storage/nad-plus_a47db95c.jpeg",
    benefits: [
      { icon: "zap", label: "Supports Cellular Energy*" },
      { icon: "dna", label: "Supports DNA Repair*" },
      { icon: "brain", label: "Supports Cognitive Vitality*" },
    ],
    description:
      "Nicotinamide Adenine Dinucleotide (NAD+) is a critical coenzyme found in every cell. Research indicates it plays a central role in energy metabolism, DNA repair, and cellular longevity pathways including sirtuin activation.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "gold",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    tagline: "Control. Transform. Excel.",
    dosage: "10MG",
    price: 99.99,
    image: "/manus-storage/tirzepatide_270282ad.jpeg",
    benefits: [
      { icon: "droplets", label: "Supports Weight Loss*" },
      { icon: "activity", label: "Supports Metabolic Health*" },
      { icon: "bar-chart-2", label: "Supports Blood Sugar Balance*" },
    ],
    description:
      "Tirzepatide is a dual GIP/GLP-1 receptor agonist. Research has shown significant potential in supporting weight management and metabolic health through dual incretin pathway activation.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "teal",
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    tagline: "Control Appetite. Support Results.",
    dosage: "5MG",
    price: 99.99,
    image: "/manus-storage/semaglutide_ed687cd5.jpeg",
    benefits: [
      { icon: "shield-plus", label: "Supports Weight Management*" },
      { icon: "droplets", label: "Supports Metabolic Health*" },
      { icon: "target", label: "Supports Appetite Control*" },
    ],
    description:
      "Semaglutide is a GLP-1 receptor agonist that research shows may support appetite regulation, weight management, and metabolic health through central and peripheral mechanisms.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "blue",
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    tagline: "Regenerate. Repair. Rejuvenate.",
    dosage: "50MG",
    price: 99.99,
    image: "/manus-storage/ghk-cu_7c12870a.jpeg",
    benefits: [
      { icon: "shield", label: "Supports Skin Health*" },
      { icon: "dna", label: "Supports Cellular Repair*" },
      { icon: "layers", label: "Supports Collagen Production*" },
    ],
    description:
      "GHK-Cu (Copper Peptide) is a naturally occurring tripeptide. Research suggests it activates wound healing, tissue remodeling, collagen synthesis, and anti-inflammatory pathways at the cellular level.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "copper",
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    tagline: "Multi-Pathway. Maximum Results.",
    dosage: "10MG",
    price: 99.99,
    image: "/manus-storage/retatrutide_ce97c417.jpeg",
    benefits: [
      { icon: "shield-plus", label: "Supports Fat Loss*" },
      { icon: "flame", label: "Supports Metabolism*" },
      { icon: "bar-chart-2", label: "Supports Glucose Control*" },
    ],
    description:
      "Retatrutide is a triple agonist targeting GIP, GLP-1, and glucagon receptors simultaneously. Research indicates it may offer superior metabolic support through multi-pathway activation compared to single or dual agonists.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "crimson",
  },
  {
    id: "bp-157",
    name: "BP-157",
    tagline: "Recover. Heal. Perform.",
    dosage: "5MG",
    price: 99.99,
    image: "/manus-storage/bp-157_39a58e11.jpeg",
    benefits: [
      { icon: "shield-plus", label: "Supports Recovery*" },
      { icon: "heart-pulse", label: "Supports Healing*" },
      { icon: "zap", label: "Supports Performance*" },
    ],
    description:
      "BPC-157 (Body Protection Compound) is a pentadecapeptide derived from a protein found in gastric juice. Research suggests significant potential in supporting tissue repair, gut health, and systemic recovery processes.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "navy",
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    tagline: "Grow. Repair. Perform.",
    dosage: "5MG",
    price: 99.99,
    image: "/manus-storage/tesamorelin_821a25c7.jpeg",
    benefits: [
      { icon: "shield-plus", label: "Supports Muscle Growth*" },
      { icon: "refresh-cw", label: "Supports Recovery*" },
      { icon: "dumbbell", label: "Supports Lean Body Composition*" },
    ],
    description:
      "Tesamorelin is a synthetic analog of growth hormone-releasing hormone (GHRH). Research indicates it may support growth hormone secretion, lean body mass, and metabolic function through pituitary stimulation.",
    disclaimer: "For Research Use Only. Not for Human Consumption.",
    color: "purple",
  },
];

export const valor1775Stats = {
  products: 8,
  price: "$99.99",
  disclaimer: "All products for research use only",
  brand: "Valor 1775",
  tagline: "Strength. Purpose. Honor.",
  motto: "Semper Fidelis",
};
