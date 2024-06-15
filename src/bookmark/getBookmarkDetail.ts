import {
  BlockObjectResponse,
  ListBlockChildrenResponse
} from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';
import { Content } from './type';

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

  mappedInnerBlockData.forEach((child) => {
    const index = blocks.findIndex((block) => block!.id === child.parentId);
    blocks[index] = { ...blocks[index], ...(child as any) };
  });

  return blocks;
};

const parseCallout = async (secretToken: string, ids: string[]) => {
  const blockPromises = ids.map((id) => getBookmarkBlockData(secretToken, id));
  const blockResponse = await Promise.all(blockPromises);
  const result = await Promise.all(
    blockResponse.map((item) => mapInnerBlockData(secretToken, item))
  );
  return result;
};

const getBookmarkBlockData = (secretToken: string, blockId: string) => {
  return client.blocks.children.list({
    auth: secretToken,
    block_id: blockId
  });
};

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

const mapInnerBlockData = async (
  secretToken: string,
  response: ListBlockChildrenResponse
) => {
  const results = response.results as BlockObjectResponse[];

  const contents: Content[] = [];
  const calloutContentsPromise: Promise<any>[] = [];
  const parentId = (results[0].parent.type === 'block_id' &&
    results[0].parent.block_id) as string;

  results.forEach(async (result) => {
    if (result.type === 'paragraph') {
      result.paragraph.rich_text.forEach((richText) => {
        if (!richText.plain_text) return;

        return contents.push({
          id: result.id,
          type: 'text',
          text: richText.plain_text,
          ...(richText.href && { url: richText.href })
        });
      });
    }

    if (result.type === 'image') {
      return contents.push({
        id: result.id,
        type: 'image',
        url: (result.image.type === 'external' &&
          result.image.external.url) as string
      });
    }

    if (result.type === 'bookmark') return;

    if (result.type === 'callout') {
      calloutContentsPromise.push(parseCallout(secretToken, [result.id]));
      const author = {
        name: result.callout.rich_text[0].plain_text,
        username: result.callout.rich_text[2].plain_text,
        avatar: (result.callout.icon?.type === 'external' &&
          result.callout.icon.external.url) as string
      };
      return contents.push({ id: result.id, type: 'callout', author });
    }

    return { id: result.id, type: 'text', text: '\n' };
  });

  const [calloutContents] = await Promise.all(calloutContentsPromise);

  calloutContents?.forEach((callout: Content & { parentId: string }) => {
    const index = contents.findIndex(
      (content) => content.id === callout.parentId
    );
    contents[index] = { ...contents[index], ...callout };
    callout.parentId;
  });

  return { parentId, contents };
};

export default getBookmarkDetail;
