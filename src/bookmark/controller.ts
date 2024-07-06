import { Hono } from 'hono';
import getBookmarks from './getBookmarks';
import getBookmarkDetail from './getBookmarkDetail';
import { validator } from 'hono/validator';
import { headerValidator, queryValidator } from './validator';
import getBookmarkTags from './getBookmarkTags';
import { Filter } from './type';

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
    const { startCursor, ...restFilter } = c.req.valid('query');
    const { databaseId } = c.req.param();
    const tags = c.req.queries('tags');

    const filter: Filter = { ...restFilter, tags };

    return c.json(await getBookmarks(token, databaseId, filter, startCursor));
  }
);

bookmark.get(
  '/:pageId/detail',
  validator('header', headerValidator),
  async (c) => {
    const { token } = c.req.valid('header');
    const { pageId } = c.req.param();

    return c.json(await getBookmarkDetail(token, pageId));
  }
);

bookmark.get(
  '/:databaseId/tags',
  validator('header', headerValidator),
  async (c) => {
    const { databaseId } = c.req.param();
    const { token } = c.req.valid('header');

    return c.json(await getBookmarkTags(token, databaseId));
  }
);

export default bookmark;
