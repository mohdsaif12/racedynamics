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
        description: settings.description,
        url: absoluteUrl("/"),
        telephone: settings.phonePrimary,
        email: settings.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: SITE.city,
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
        areaServed: "IN",
        priceRange: "₹₹₹",
        sameAs: [
          settings.social.instagram,
          settings.social.facebook,
          settings.social.youtube,
        ].filter(Boolean),
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
