import type { IPost } from './userPost';
export interface IFeedResponse {
  posts: IPost[];
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}