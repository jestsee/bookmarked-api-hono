import { Hono } from 'hono';
import getBookmarks from './getBookmarks';

const bookmark = new Hono();

bookmark.use('/*', async (c, next) => {
  const token = c.req.header('Authorization');

  if (!token) {
    return c.json({ message: 'Authorization header is required' }, 401);
  }

  await next();
});

bookmark.get('/:databaseId', async (c) => {
  const token = c.req.header('Authorization')!;
  const { databaseId } = c.req.param();

  return c.json(await getBookmarks(token.replace('Bearer ', ''), databaseId));
});

export default bookmark;
