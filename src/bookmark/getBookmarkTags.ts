import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { client } from '../notion/client';

const getBookmarkTags = async (secretToken: string, databaseId: string) => {
  const response = await client.databases.retrieve({
    auth: secretToken,
    database_id: databaseId
  });

  return { results: mapData(response) };
};

const mapData = (data: GetDatabaseResponse) => {
  const tagsData = data.properties['Tags'];

  if (tagsData.type !== 'multi_select') return;

  return tagsData.multi_select.options;
};

export default getBookmarkTags;
