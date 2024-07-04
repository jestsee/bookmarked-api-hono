import { HTTPException } from 'hono/http-exception';

export const queryValidator = (value: Record<string, string>) => {
  const type = value['type'];
  const startCursor = value['startCursor'];
  const search = value['search'];

  if (type && type != 'Tweet' && type != 'Thread') {
    throw new HTTPException(403, {
      message: 'Invalid type. Must be either "Tweet" or "Thread"'
    });
  }
  return { type: type as 'Tweet' | 'Thread', startCursor, search };
};

export const headerValidator = (value: Record<string, string>) => {
  const token = value['authorization'];

  if (!token) {
    throw new HTTPException(401, {
      message: 'Authorization header is required'
    });
  }

  return { token };
};
