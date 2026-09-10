import Hero from "@/components/marketing/Hero";
import GapSection from "@/components/marketing/GapSection";
import IndustryMarquee from "@/components/marketing/IndustryMarquee";
import HowWeCloseIt from "@/components/marketing/HowWeCloseIt";
import ReadinessBand from "@/components/marketing/ReadinessBand";
import CommunityBanner from "@/components/marketing/CommunityBanner";
import Pricing from "@/components/marketing/Pricing";
import TwoDoors from "@/components/marketing/TwoDoors";

export default function Home() {
  return (
    <>
      <Hero />
      <GapSection />
      <IndustryMarquee />
      <HowWeCloseIt />
      <ReadinessBand />
      <CommunityBanner />
      <Pricing />
      <TwoDoors />
    </>
  );
}
