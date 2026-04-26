import type { tags } from "typia";

/**
 * 답안 제출 요청
 */
export type ISubmitAnswer = {
  /**
   * 문제 ID
   */
  question_id: string & tags.Format<"uuid">;

  /**
   * 유저의 답 (객관식: "A"~"D", 단답형: 자유 입력, 서술형: 텍스트)
   */
  user_answer: string & tags.MinLength<1> & tags.MaxLength<5000>;

  /**
   * 세션 ID (세션 내 답안 제출 시)
   */
  session_id?: undefined | (string & tags.Format<"uuid">);
};
