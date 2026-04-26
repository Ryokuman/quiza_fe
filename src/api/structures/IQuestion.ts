import type { tags } from "typia";

/**
 * 문제 응답
 */
export type IQuestion = {
  id: string & tags.Format<"uuid">;
  tag: {
    id: string;
    name: string;
  };
  type: "multi" | "single" | "essay";
  difficulty: number;
  content: string;
  options: string[];
  answer: string;
  explanation: null | string;
  rubric: null | string;
  max_score: number;
  created_at: string & tags.Format<"date-time">;
};
