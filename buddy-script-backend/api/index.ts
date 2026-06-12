import app from '../src/app.js';
import '../src/utils/bigint-json.js';

export default function handler(req: any, res: any) {
  return app(req, res);
}
