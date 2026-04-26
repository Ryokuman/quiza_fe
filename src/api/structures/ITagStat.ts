/**
 * 태그별 통계
 */
export type ITagStat = {
  /**
   * 태그명
   */
  tag: string;

  /**
   * 해당 태그의 총 답변 수
   */
  total: number;

  /**
   * 해당 태그의 정답 수
   */
  correct: number;

  /**
   * 정답률 (0~100)
   */
  accuracy: number;

  /**
   * 점수율 (0~100, 부분점수 반영)
   */
  score_rate: number;
};
