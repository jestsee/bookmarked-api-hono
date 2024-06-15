import { Hono } from 'hono';
import bookmark from './bookmark/controller';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.route('/bookmarks', bookmark);

export default app;
