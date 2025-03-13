export interface IUser {
    _id: string,
    username: string;
    firstname: string;
    surname: string;
    email: string;
    avatar_url: string;
  }

  export interface IUsersResponse {
    users: IUser[];
  }