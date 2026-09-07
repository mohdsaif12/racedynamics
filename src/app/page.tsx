import HeroSequence from "@/components/HeroSequence";
import SectionCard from "@/components/SectionCard";
import Testimonials from "@/components/home/Testimonials";
import PopularBikesCarousel from "@/components/home/PopularBikesCarousel";
import {
  AboutBand,
  BrandStrip,
  BrowseByCategory,
  BrowseDatabase,
  PlanningToSell,
  TiltedStrip,
  TrustBand,
} from "@/components/home/Sections";

/**
 * Homepage — animation hierarchy:
 *
 *   HERO          → most cinematic (scroll-driven frame sequence)
 *   DRAWER ZONE   → PlanningToSell + BrowseByCategory as sticky cards
 *   NORMAL ZONE   → everything else scrolls naturally with subtle reveals
 *   FOOTER        → static / minimal
 *
 * Only two sections use the sticky-card drawer. The rest use masked heading
 * reveals, staggered fades, and subtle scroll-driven motion — giving the
 * page a clear hierarchy instead of every section competing for attention.
 */
export default function HomePage() {
  return (
    <>
      <HeroSequence />

      {/* ── DRAWER ZONE ─────────────────────────────────────────────
          Two sticky cards in one shared parent. PlanningToSell pins
          first; BrowseByCategory rises over it and pins in turn.    */}
      <div className="relative">
        <SectionCard tone="paper" dwell={45}>
          <PlanningToSell />
        </SectionCard>

        <SectionCard tone="ink" dwell={50}>
          <BrowseByCategory />
        </SectionCard>
      </div>

      {/* ── NORMAL ZONE ─────────────────────────────────────────────
          Standard scroll with subtle reveals. No sticky pinning.    */}
      <BrowseDatabase />
      <TiltedStrip />
      <TrustBand />
      <PopularBikesCarousel />
      <AboutBand />
      <Testimonials />
      <BrandStrip />
    </>
  );
}
