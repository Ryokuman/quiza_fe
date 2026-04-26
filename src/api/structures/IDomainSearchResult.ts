export type IDomainSearchResult = {
  tags: string[];
  matches: {
    id: string;
    name: string;
    similarity: number;
  }[];
};
