import {
  BlockObjectResponse,
  ListBlockChildrenResponse
} from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';
import { Content } from './type';

const parseCallout = async (secretToken: string, ids: string[]) => {
  const blockPromises = ids.map((id) => getBookmarkBlockData(secretToken, id));
  const blockResponse = await Promise.all(blockPromises);
  return blockResponse.map(mapInnerBlockData);
};

// TODO
// handle nested callout: quoted tweet
const getBookmarkDetail = async (secretToken: string, pageId: string) => {
  const response = await getBookmarkBlockData(secretToken, pageId);

  const blocks = mapResponseData(response);

  /**
   * parse callout
   */
  const mappedInnerBlockData = await parseCallout(
    secretToken,
    blocks.map((block) => block!.id)
  );

  /**
   * prepare the final data
   */
  const finalData = [];
  for (const parent of blocks) {
    for (const child of mappedInnerBlockData) {
      if (parent!.id === child.parentId) {
        finalData.push({ ...parent, ...child });
      }
    }
  }

  return finalData;
};

const getBookmarkBlockData = (secretToken: string, blockId: string) => {
  return client.blocks.children.list({
    auth: secretToken,
    block_id: blockId
  });
};

// tweet url, author, avatar
// need to get each block id first
// if has_children is true, then get the children
const mapResponseData = (response: ListBlockChildrenResponse) => {
  return (response.results as BlockObjectResponse[]).map((result) => {
    const callout = result.type === 'callout' && result.callout;

    if (!callout) return;

    return {
      id: result.id,
      author: {
        name: callout.rich_text[0].plain_text,
        username: callout.rich_text[2].plain_text,
        avatar: callout.icon?.type === 'external' && callout.icon.external.url
      },
      tweetUrl: callout.rich_text[2].href
    };
  });
};

const mapInnerBlockData = (response: ListBlockChildrenResponse) => {
  const results = response.results as BlockObjectResponse[];

  const content: Content[] = [];
  const parentId = (results[0].parent.type === 'block_id' &&
    results[0].parent.block_id) as string;

  results.forEach(async (result) => {
    if (result.type === 'paragraph') {
      result.paragraph.rich_text.forEach((richText) => {
        if (!richText.plain_text) return;

        return content.push({
          id: result.id,
          type: 'text',
          text: richText.plain_text,
          ...(richText.href && { url: richText.href })
        });
      });
    }

    if (result.type === 'image') {
      return content.push({
        id: result.id,
        type: 'image',
        url: (result.image.type === 'external' &&
          result.image.external.url) as string
      });
    }

    if (result.type === 'bookmark') return;

    if (result.type === 'callout')
      return content.push({ id: result.id, type: 'callout' });

    content.push({ id: result.id, type: 'text', text: '\n' });
  });

  return { parentId, content };
};

export default getBookmarkDetail;
