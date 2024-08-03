import { client } from '../notion/client';

const deleteBookmark = (secretToken: string, pageId: string) => {
  return client.pages.update({
    auth: secretToken,
    page_id: pageId,
    archived: true
  });
};

export default deleteBookmark;
