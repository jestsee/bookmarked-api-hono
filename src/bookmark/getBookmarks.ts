import {
  PageObjectResponse,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';

const getBookmarks = async (secretToken: string, databaseId: string) => {
  const response = await client.databases.query({
    auth: secretToken,
    database_id: databaseId
  });

  return mapData(response);
};

const mapData = (data: QueryDatabaseResponse) => {
  return (data.results as PageObjectResponse[]).map((result) => {
    return {
      id: result.id,
      createdTime: result.created_time,
      updatedTime: result.last_edited_time,
      icon: result.icon?.type === 'external' && result.icon.external.url,
      isLiked:
        result.properties['Liked'].type === 'checkbox' &&
        result.properties['Liked'].checkbox,
      author:
        result.properties['Author'].type === 'rich_text' &&
        result.properties['Author'].rich_text[0].plain_text,
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
