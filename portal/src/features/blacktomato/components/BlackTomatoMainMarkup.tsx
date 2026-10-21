import { Suspense } from "react";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import { BlackTomatoContentSpacerSectionMarkup } from "./BlackTomatoContentSpacerSectionMarkup";
import { BlackTomatoCustomerTestimonialsSectionMarkup } from "./BlackTomatoCustomerTestimonialsSectionMarkup";
import { BlackTomatoHeroSectionMarkup } from "./BlackTomatoHeroSectionMarkup";
import { BlackTomatoJourneySection } from "./BlackTomatoJourneySection";
import { BlackTomatoJourneySectionVariant } from "./BlackTomatoJourneySectionVariant";
import { BlackTomatoLuxuryTravelGuideSectionMarkup } from "./BlackTomatoLuxuryTravelGuideSectionMarkup";
import { BlackTomatoPressTestimonialsSectionMarkup } from "./BlackTomatoPressTestimonialsSectionMarkup";
import { BlackTomatoPursuitOfFeelingSectionMarkup } from "./BlackTomatoPursuitOfFeelingSectionMarkup";
import { BlackTomatoReadyToStartSectionMarkup } from "./BlackTomatoReadyToStartSectionMarkup";
import { BlackTomatoWhatWeDoSectionMarkup } from "./BlackTomatoWhatWeDoSectionMarkup";
import { BlackTomatoWhyUsSectionMarkup } from "./BlackTomatoWhyUsSectionMarkup";

export function BlackTomatoMainMarkup() {
  return (
    <div>
      <BlackTomatoHeroSectionMarkup />
      <BlackTomatoCustomerTestimonialsSectionMarkup />
      <Suspense
        fallback={
          <>
            <BlackTomatoBookingBudgetSection variant="drawer" />
            <BlackTomatoJourneySection />
          </>
        }
      >
        <BlackTomatoJourneySectionVariant />
      </Suspense>
      <BlackTomatoPressTestimonialsSectionMarkup />
      <BlackTomatoContentSpacerSectionMarkup />
      {/* <BlackTomatoWhatWeDoSectionMarkup /> */}
      {/* <BlackTomatoPursuitOfFeelingSectionMarkup /> */}
      {/* <BlackTomatoLuxuryTravelGuideSectionMarkup /> */}
      {/* <BlackTomatoWhyUsSectionMarkup /> */}
      {/* <BlackTomatoReadyToStartSectionMarkup /> */}
    </div>
  );
}
