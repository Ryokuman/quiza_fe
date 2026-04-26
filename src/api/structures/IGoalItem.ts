export type IGoalItem = {
  id: string;
  domain: {
    id: string;
    name: string;
  };
  target: string;
  level: string;
  is_active: boolean;
  created_at: string;
  hasRoadmap: boolean;
};
