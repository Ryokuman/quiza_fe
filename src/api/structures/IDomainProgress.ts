export type IDomainProgress = {
  id: string;
  name: string;
  goalId: string;
  target: string;
  level: string;
  checkpoints: {
    total: number;
    passed: number;
    in_progress: number;
  };
};
