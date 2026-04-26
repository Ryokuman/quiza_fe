import type { IRoadmapProgress } from "./IRoadmapProgress";
import type { ITagStat } from "./ITagStat";

/**
 * 유저 종합 통계 응답
 */
export type IStats = {
  /**
   * 태그별 정답률 통계
   */
  tag_stats: ITagStat[];

  /**
   * 총 답변 수
   */
  total_answered: number;

  /**
   * 로드맵 진행률
   */
  roadmap_progress: IRoadmapProgress;
};
