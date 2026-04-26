export type ICheckpointItem = {
  id: string;
  title: string;
  description: null | string;
  tag_id: string;
  tag_name?: undefined | string;
  difficulty: number;
  order: number;
  status: string;
  best_score: null | number;
  attempts: number;
};
export namespace ICheckpointItem {
  export type o1 = {
    id: string;
    title: string;
    description: null | string;
    tag_id: string;
    tag_name?: undefined | string;
    difficulty: number;
    order: number;
    status: string;
    best_score: null | number;
    attempts: number;
  };
}
