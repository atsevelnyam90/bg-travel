import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import { BlackTomatoContentSpacerSectionMarkup } from "./BlackTomatoContentSpacerSectionMarkup";
import { BlackTomatoCustomerTestimonialsSectionMarkup } from "./BlackTomatoCustomerTestimonialsSectionMarkup";
import { BlackTomatoHeroSectionMarkup } from "./BlackTomatoHeroSectionMarkup";
import { BlackTomatoJourneySection } from "./BlackTomatoJourneySection";
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
      <BlackTomatoBookingBudgetSection variant="drawer" />
      <BlackTomatoCustomerTestimonialsSectionMarkup />
      <BlackTomatoJourneySection />
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
