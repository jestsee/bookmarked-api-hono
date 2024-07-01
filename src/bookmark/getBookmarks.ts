import {
  PageObjectResponse,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';

const getBookmarks = async (
  secretToken: string,
  databaseId: string,
  startCursor?: string
) => {
  const response = await client.databases.query({
    auth: secretToken,
    database_id: databaseId,
    start_cursor: startCursor
  });

  return {
    results: mapData(response),
    nextCursor: response.next_cursor,
    hasMore: response.has_more
  };
};

const extractAuthorInfo = (authorData: string) => {
  const pattern = /^(.*?)\s+\(@(.*?)\)$/;
  const match = RegExp(pattern).exec(authorData);

  if (!match) return;

  return {
    name: match[1],
    username: `@${match[2]}`
  };
};

const mapData = (data: QueryDatabaseResponse) => {
  return (data.results as PageObjectResponse[]).map((result) => {
    if (result.properties['Author'].type !== 'rich_text') return;

    const authorData = result.properties['Author'].rich_text[0].plain_text;
    const author = {
      avatar: result.icon?.type === 'external' && result.icon.external.url,
      ...extractAuthorInfo(authorData)
    };

    return {
      id: result.id,
      createdTime: result.created_time,
      updatedTime: result.last_edited_time,
      isLiked:
        result.properties['Liked'].type === 'checkbox' &&
        result.properties['Liked'].checkbox,
      type:
        result.properties['Type'].type === 'select' &&
        result.properties['Type'].select?.name.toLowerCase(),
      author,
      tags:
        result.properties['Tags'].type === 'multi_select' &&
        result.properties['Tags'].multi_select,
      tweetedTime:
        result.properties['Tweet Date'].type === 'date' &&
        result.properties['Tweet Date'].date?.start,
      title:
        result.properties['Tweet'].type === 'title' &&
        result.properties['Tweet'].title[0].plain_text,
      tweetUrl:
        result.properties['Tweet Link'].type === 'url' &&
        result.properties['Tweet Link'].url,
      notionUrl: result.url,
      publicUrl: result.public_url
    };
  });
};

export default getBookmarks;
