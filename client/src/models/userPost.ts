export interface IPost {
    _id: string;
    user_id: {
      _id: string;
      firstname: string;
      surname: string;
    };
    content: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
  }
  