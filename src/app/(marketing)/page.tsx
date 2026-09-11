import Hero from "@/components/marketing/Hero";
import AudienceSection from "@/components/marketing/AudienceSection";
import GapSection from "@/components/marketing/GapSection";
import IndustryMarquee from "@/components/marketing/IndustryMarquee";
import HowWeCloseIt from "@/components/marketing/HowWeCloseIt";
import SkillTracksGrid from "@/components/marketing/SkillTracksGrid";
import ReadinessBand from "@/components/marketing/ReadinessBand";
import CommunityBanner from "@/components/marketing/CommunityBanner";
import StudentPreview from "@/components/marketing/StudentPreview";
import InstitutionPreview from "@/components/marketing/InstitutionPreview";
import Pricing from "@/components/marketing/Pricing";
import TwoDoors from "@/components/marketing/TwoDoors";

export default function Home() {
  return (
    <>
      <Hero />
      <AudienceSection />
      <GapSection />
      <IndustryMarquee />
      <HowWeCloseIt />
      <SkillTracksGrid />
      <ReadinessBand />
      <CommunityBanner />
      <StudentPreview />
      <InstitutionPreview />
      <Pricing />
      <TwoDoors />
    </>
  );
}
