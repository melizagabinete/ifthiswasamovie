// types/posts.ts
export interface NowShowingPost {
  title: string;
  url: string;
  points: number;
  submittedById: string;
  submittedByName: string;
  submittedAt: Date;
  votes: string[];
  _id?: string;
}
