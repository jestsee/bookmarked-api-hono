import { Hono } from 'hono';
import getBookmarks from './getBookmarks';
import getBookmarkDetail from './getBookmarkDetail';
import { validator } from 'hono/validator';
import { headerValidator, queryValidator } from './validator';

const bookmark = new Hono();

bookmark.onError((error, c) => {
  return c.json({ message: error.message }, 500);
});

bookmark.get(
  '/:databaseId',
  validator('query', queryValidator),
  validator('header', headerValidator),
  async (c) => {
    const { token } = c.req.valid('header')!;
    const { startCursor, ...filter } = c.req.valid('query');
    const { databaseId } = c.req.param();

    return c.json(
      await getBookmarks(
        token.replace('Bearer ', ''),
        databaseId,
        filter,
        startCursor
      )
    );
  }
);

bookmark.get('/:pageId/detail', async (c) => {
  const token = c.req.header('Authorization')!;
  const { pageId } = c.req.param();

  return c.json(await getBookmarkDetail(token.replace('Bearer ', ''), pageId));
});

export default bookmark;
