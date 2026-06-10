// $HERO Animated NFT Collection — Heroes Hall of Honor
// Design: Cinematic Blockbuster Showcase
// Navy blue + burnished gold, Playfair Display + Bebas Neue + Source Sans 3

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollectionSection from "@/components/CollectionSection";
import UtilitySection from "@/components/UtilitySection";
import RoadmapSection from "@/components/RoadmapSection";
import RevenueSection from "@/components/RevenueSection";
import TechSection from "@/components/TechSection";
import MintSection from "@/components/MintSection";
import WaitlistSection from "@/components/WaitlistSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <CollectionSection />
      <UtilitySection />
      <RoadmapSection />
      <RevenueSection />
      <TechSection />
      <MintSection />
      <WaitlistSection />
      <Footer />
    </div>
  );
}
