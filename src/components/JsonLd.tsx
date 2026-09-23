import type { Bike, SiteSettings } from "@/lib/data/types";
import { SITE } from "@/lib/site";
import { absoluteUrl } from "@/lib/url";

/**
 * Structured data. This is what puts price, availability and mileage directly
 * into a Google result for a bike, and puts the dealership into the local pack
 * — worth more to a single-city dealer than any amount of keyword work.
 *
 * Rendered from Server Components only, so the JSON is in the initial HTML
 * where crawlers will actually see it.
 */
function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own data, not user input, and JSON.stringify
      // escapes the quotes. `<` is escaped so a stray "</script>" inside any
      // free-text field (a bike name, an address) cannot close the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "@id": absoluteUrl("/#dealer"),
        name: SITE.name,
        // Every way someone actually types the brand into a search box —
        // squashed together, with the city appended, with "motorcycles"
        // instead of "dynamics" trailing off. This is what lets a search for
        // any of them resolve to the same knowledge-panel entity rather than
        // Google guessing.
        alternateName: [
          "RaceDynamics",
          "Race Dynamics Lucknow",
          "RaceDynamics Lucknow",
          "Race Dynamics Motorcycles",
        ],
        description: settings.description,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/brand/racedynamics.png"),
        image: absoluteUrl("/brand/racedynamics.png"),
        telephone: settings.phonePrimary,
        email: settings.email,
        foundingDate: "2014",
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: SITE.city,
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
        // The coordinates and the Maps listing are what tie this markup to
        // the real place Google already knows about, which is the difference
        // between appearing in the local pack and not.
        geo: {
          "@type": "GeoCoordinates",
          latitude: SITE.maps.lat,
          longitude: SITE.maps.lng,
        },
        hasMap: SITE.maps.url,
        areaServed: "IN",
        priceRange: "₹₹₹",
        sameAs: [
          settings.social.instagram,
          settings.social.facebook,
          settings.social.youtube,
          SITE.maps.url,
        ].filter(Boolean),
      }}
    />
  );
}

/**
 * Separate from AutoDealer above (which describes the *business*) — this
 * describes the *website* itself, and is what makes Google consider showing
 * a search box directly under the homepage result for a branded query.
 * Points at a real, working search: /inventory?search= actually pre-fills
 * and runs the inventory search box, it isn't a dead query param.
 */
export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE.name,
        alternateName: ["RaceDynamics", "Race Dynamics Lucknow"],
        url: absoluteUrl("/"),
        publisher: { "@id": absoluteUrl("/#dealer") },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: absoluteUrl("/inventory?search={search_term_string}"),
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

const AVAILABILITY: Record<Bike["status"], string> = {
  available: "https://schema.org/InStock",
  booked: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
  "on-request": "https://schema.org/InStock",
};

export function BikeJsonLd({ bike }: { bike: Bike }) {
  const name = `${bike.year} ${bike.brand} ${bike.fullName}`;

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Vehicle",
        name,
        url: absoluteUrl(`/bike/${bike.slug}`),
        brand: { "@type": "Brand", name: bike.brand },
        model: bike.fullName,
        vehicleModelDate: String(bike.year),
        productionDate: String(bike.year),
        vehicleConfiguration: bike.category,
        bodyType: "Motorcycle",
        itemCondition: "https://schema.org/UsedCondition",
        ...(bike.images.length > 0 && { image: bike.images }),
        ...(bike.engineCc > 0 && {
          vehicleEngine: {
            "@type": "EngineSpecification",
            engineDisplacement: {
              "@type": "QuantitativeValue",
              value: bike.engineCc,
              unitCode: "CMQ", // cubic centimetre
            },
          },
        }),
        mileageFromOdometer: {
          "@type": "QuantitativeValue",
          value: bike.km,
          unitCode: "KMT",
        },
        offers: {
          "@type": "Offer",
          availability: AVAILABILITY[bike.status],
          itemCondition: "https://schema.org/UsedCondition",
          priceCurrency: "INR",
          // Schema.org treats 0 as "free", so an on-request bike omits price
          // entirely rather than claiming one.
          ...(bike.priceINR != null && { price: bike.priceINR }),
          seller: { "@id": absoluteUrl("/#dealer") },
          url: absoluteUrl(`/bike/${bike.slug}`),
        },
      }}
    />
  );
}
