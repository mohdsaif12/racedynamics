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
import { getAllBikes, getFeaturedBikes } from "@/lib/data/bikes";
import { getCategories } from "@/lib/data/categories";
import { getTestimonials } from "@/lib/data/testimonials";
import { getSiteContentBlock } from "@/lib/data/siteContent";

/**
 * Homepage — animation hierarchy:
 *
 *   HERO          → most cinematic (scroll-driven frame sequence)
 *   DRAWER ZONE   → PlanningToSell + BrowseByCategory as sticky cards
 *   NORMAL ZONE   → everything else scrolls naturally with subtle reveals
 *   FOOTER        → static / minimal
 *
 * All content below the hero comes from the database (src/lib/data) — bikes,
 * categories, featured picks and testimonials — with a static-seed fallback
 * so the page still renders before a Supabase project exists.
 */
export default async function HomePage() {
  const [bikes, categories, featured, testimonials, sellContent] = await Promise.all([
    getAllBikes(),
    getCategories(),
    getFeaturedBikes(),
    getTestimonials(),
    getSiteContentBlock("planning_to_sell"),
  ]);

  return (
    <>
      <HeroSequence />

      {/* ── DRAWER ZONE ─────────────────────────────────────────────
          Two sticky cards in one shared parent. PlanningToSell pins
          first; BrowseByCategory rises over it and pins in turn.    */}
      <div className="relative">
        <SectionCard tone="paper" dwell={45}>
          <PlanningToSell bikes={bikes} content={sellContent} />
        </SectionCard>

        <SectionCard tone="ink" dwell={50}>
          <BrowseByCategory categories={categories} bikes={bikes} />
        </SectionCard>
      </div>

      {/* ── NORMAL ZONE ─────────────────────────────────────────────
          Standard scroll with subtle reveals. No sticky pinning.    */}
      <BrowseDatabase bikeCount={bikes.length} />
      <TiltedStrip bikes={bikes} />
      <TrustBand />
      <PopularBikesCarousel bikes={featured} />
      <AboutBand />
      <Testimonials testimonials={testimonials} />
      <BrandStrip />
    </>
  );
}
