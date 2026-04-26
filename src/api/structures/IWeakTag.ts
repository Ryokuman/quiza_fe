/**
 * 약점 태그 정보
 */
export type IWeakTag = {
  /**
   * 태그명
   */
  tag: string;

  /**
   * 정답률 (0~100)
   */
  accuracy: number;

  /**
   * 점수율 (0~100, 부분점수 반영)
   */
  score_rate: number;

  /**
   * 총 시도 수
   */
  total_attempts: number;
};
