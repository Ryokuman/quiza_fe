import type { tags } from "typia";

/**
 * 문제 생성 요청 (프리미엄 전용)
 */
export type IGenerateQuestions = {
  /**
   * 태그 ID (UUID)
   */
  tagId: string & tags.Format<"uuid">;

  /**
   * 난이도 (1~5)
   */
  difficulty: number & tags.Minimum<1> & tags.Maximum<5>;

  /**
   * 생성할 문제 수 (1~10)
   */
  count: number & tags.Minimum<1> & tags.Maximum<10>;

  /**
   * 문제 타입 (기본: multi)
   */
  type?: undefined | "multi" | "single" | "essay";
};
