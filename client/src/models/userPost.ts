export interface IPost {
    _id: string;
    user_id: {
      _id: string;
      firstname: string;
      surname: string;
      avatar_url: string;
    };
    content: string;
    image_url?: string;
    likes: string[];
    created_at: string;
    updated_at: string;
  }
  