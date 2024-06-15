export type Content =
  | {
      type: 'text';
      id: string;
      text: string;
      url?: string;
    }
  | {
      type: 'image';
      id: string;
      url: string;
    }
  | {
      type: 'callout';
      id: string;
    };
