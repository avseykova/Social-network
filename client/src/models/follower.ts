export interface IFollower {
    _id: string;
    firstname: string;
    surname: string;
    avatar_url?: string;
    followers: string[];
  }