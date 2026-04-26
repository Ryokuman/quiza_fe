/**
 * 세션 완료 결과
 */
export type ISessionCompleteResult = {
  /**
   * 점수 (0~1)
   */
  score: number;

  /**
   * 전체 문제 수
   */
  total: number;

  /**
   * 정답 수
   */
  correct: number;

  /**
   * 합격 여부 (score >= 0.7)
   */
  passed: boolean;

  /**
   * 체크포인트 상태
   */
  checkpoint_status: string;
};
