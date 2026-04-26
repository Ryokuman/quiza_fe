import type { IWeakTag } from "./IWeakTag";

/**
 * 학습 조언 응답
 */
export type IAdviceResult = {
  /**
   * Gemini가 생성한 개인화 학습 조언
   */
  advice: string;

  /**
   * 약점 태그 목록
   */
  weak_tags: IWeakTag[];
};
