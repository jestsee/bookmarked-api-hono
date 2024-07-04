import { Hono } from 'hono';
import getBookmarks from './getBookmarks';
import tokenValidator from '../middleware/tokenValidator';
import getBookmarkDetail from './getBookmarkDetail';
import { Filter } from './type';

const bookmark = new Hono();

bookmark.use(tokenValidator);

bookmark.onError((error, c) => {
  return c.json({ message: error.message }, 500);
});

bookmark.get('/:databaseId', async (c) => {
  const token = c.req.header('Authorization')!;
  const { databaseId } = c.req.param();
  const startCursor = c.req.query('startCursor');
  const search = c.req.query('search');

  const filter: Filter = {
    search
  };

  return c.json(
    await getBookmarks(
      token.replace('Bearer ', ''),
      databaseId,
      filter,
      startCursor
    )
  );
});

bookmark.get('/:pageId/detail', async (c) => {
  const token = c.req.header('Authorization')!;
  const { pageId } = c.req.param();

  return c.json(await getBookmarkDetail(token.replace('Bearer ', ''), pageId));
});

export default bookmark;
