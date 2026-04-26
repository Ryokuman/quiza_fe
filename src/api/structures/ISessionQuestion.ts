import type { tags } from "typia";

/**
 * 세션에 포함된 문제 (정답은 제외)
 */
export type ISessionQuestion = {
  /**
   * 문제 ID
   */
  id: string & tags.Format<"uuid">;

  /**
   * 문제 태그
   */
  tag: string;

  /**
   * 문제 유형
   */
  type: "multi" | "single";

  /**
   * 난이도 (1~5)
   */
  difficulty: number;

  /**
   * 문제 본문
   */
  content: string;

  /**
   * 객관식 선택지. 단답형이면 빈 배열.
   */
  options: string[];
};
