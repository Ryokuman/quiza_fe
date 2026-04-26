import type { tags } from "typia";

export type IOnboardingChatBody = {
  /**
   * 유저 입력 메시지
   */
  message: string & tags.MinLength<1>;

  /**
   * 현재 턴 (1~3)
   */
  turn: number & tags.Minimum<1> & tags.Maximum<3>;

  /**
   * 이전 턴에서 누적된 컨텍스트 (클라이언트가 관리)
   */
  context?:
    | undefined
    | {
        suggestedDomains?:
          | undefined
          | {
              id: string;
              name: string;
              similarity: number;
            }[];
        selectedDomainId?: undefined | string;
        selectedDomainName?: undefined | string;
        suggestedTags?:
          | undefined
          | {
              id: string;
              name: string;
            }[];
        selectedTagIds?: undefined | string[];
      };
};
