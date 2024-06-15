import { Hono } from 'hono';
import getBookmarks from './getBookmarks';
import tokenValidator from '../middleware/tokenValidator';

const bookmark = new Hono();

bookmark.use(tokenValidator);
bookmark.onError((error, c) => {
  return c.json({ message: error.message }, 500);
});

bookmark.get('/:databaseId', async (c) => {
  const token = c.req.header('Authorization')!;
  const { databaseId } = c.req.param();

  return c.json(await getBookmarks(token.replace('Bearer ', ''), databaseId));
});

export default bookmark;
