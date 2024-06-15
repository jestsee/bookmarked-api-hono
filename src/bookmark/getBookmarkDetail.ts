import {
  BlockObjectResponse,
  ListBlockChildrenResponse
} from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';

// TODO
// handle nested callout: quoted tweet
// handle notion bookmark url
// handle image
const getBookmarkDetail = async (secretToken: string, pageId: string) => {
  const response = await getBookmarkBlockData(secretToken, pageId);
  const blocks = mapResponseData(response);

  const blockPromises = blocks.map((result) =>
    getBookmarkBlockData(secretToken, result!.id)
  );
  const blockResponse = await Promise.all(blockPromises);
  const mappedInnerBlockData = blockResponse.map(mapInnerBlockData);

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
function mapResponseData(response: ListBlockChildrenResponse) {
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
}

function mapInnerBlockData(response: ListBlockChildrenResponse) {
  const results = response.results as BlockObjectResponse[];

  let text = '';
  const urlsInText: { url: string; text: string }[] = [];
  const parentId = (results[0].parent.type === 'block_id' &&
    results[0].parent.block_id) as string;

  results.forEach((result) => {
    const paragraph = result.type === 'paragraph' && result.paragraph;

    if (!paragraph) return;

    paragraph.rich_text.forEach((richText) => {
      if (richText.href) {
        urlsInText.push({ url: richText.href, text: richText.plain_text });
      }
      text += richText.plain_text;
    });
    text += '\n';
  });

  return { parentId, text, urlsInText };
}

export default getBookmarkDetail;
