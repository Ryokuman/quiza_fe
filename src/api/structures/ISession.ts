import type { tags } from "typia";

import type { ISessionQuestion } from "./ISessionQuestion";

/**
 * 세션 응답
 */
export type ISession = {
  /**
   * 세션 ID
   */
  session_id: string & tags.Format<"uuid">;

  /**
   * 세션에 포함된 문제 목록 (~15개)
   */
  questions: ISessionQuestion[];
};
