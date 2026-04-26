import type { IOnboardingConfirmed } from "./IOnboardingConfirmed";
import type { IOnboardingDomainSuggestion } from "./IOnboardingDomainSuggestion";
import type { IOnboardingTagSuggestion } from "./IOnboardingTagSuggestion";

export type IOnboardingChatResult = {
  type: "suggest_domains" | "suggest_tags" | "confirm" | "create_goal";
  message: string;
  domains?: undefined | IOnboardingDomainSuggestion[];
  tags?: undefined | IOnboardingTagSuggestion[];
  confirmed?: undefined | IOnboardingConfirmed;
};
