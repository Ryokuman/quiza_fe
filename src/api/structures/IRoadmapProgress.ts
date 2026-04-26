/**
 * 로드맵 진행률
 */
export type IRoadmapProgress = {
  /**
   * 통과한 체크포인트 수
   */
  passed: number;

  /**
   * 전체 체크포인트 수
   */
  total: number;

  /**
   * 진행률 (0~100)
   */
  percentage: number;
};
