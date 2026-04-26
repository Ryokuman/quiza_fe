import type { tags } from "typia";

/**
 * 세션 생성 요청
 */
export type ICreateSession = {
  /**
   * 세션을 구성할 체크포인트 ID
   */
  checkpoint_id: string & tags.Format<"uuid">;
};
