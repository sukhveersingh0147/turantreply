// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../backend/index';

// Disable Next.js body parsing so Express can handle it
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Let the Express app handle the request natively
  // @ts-ignore
  return app(req, res);
}
