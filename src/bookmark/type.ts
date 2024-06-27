export type Text = {
  type: 'text';
  id: string;
  text: string;
  url?: string;
};

export type Content =
  | { type: 'texts'; texts: Text[] }
  | Text
  | {
      type: 'image';
      id: string;
      url: string;
    }
  | {
      type: 'callout';
      id: string;
      author: Author;
    };

export type Author = {
  name: string;
  username: string;
  avatar: string;
};
