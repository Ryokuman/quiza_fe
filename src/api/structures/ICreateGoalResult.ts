import type { IGoalItem } from "./IGoalItem";

export type ICreateGoalResult = {
  goal: IGoalItem;
  templateMatched: boolean;
};
