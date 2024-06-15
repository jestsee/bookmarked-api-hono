import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

const tokenValidator = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization');

  if (!token) {
    throw new HTTPException(401, {
      message: 'Authorization header is required'
    });
  }

  await next();
});

export default tokenValidator;
