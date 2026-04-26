/**
 * 답안 제출 결과
 */
export type IAnswerResult = {
  /**
   * 정답 여부
   */
  is_correct: boolean;

  /**
   * 정답
   */
  correct_answer: string;

  /**
   * 해설. 없으면 null.
   */
  explanation: null | string;

  /**
   * 부분점수 (서술형). null이면 해당 없음.
   */
  score: null | number;

  /**
   * AI 채점 근거 (서술형/단답형 의미 판단). null이면 해당 없음.
   */
  grade_reason: null | string;
};
