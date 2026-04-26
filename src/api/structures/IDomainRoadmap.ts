import type { ICheckpointItem } from "./ICheckpointItem";

export type IDomainRoadmap = {
  id: string;
  title: string;
  checkpoints: ICheckpointItem[];
};
export namespace IDomainRoadmap {
  export type o1 = {
    id: string;
    title: string;
    checkpoints: ICheckpointItem.o1[];
  };
}
