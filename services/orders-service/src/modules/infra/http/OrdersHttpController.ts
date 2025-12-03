import { safeHttpHandler } from './utils/safe-http-handler';

export class OrdersHttpController {
  public example = safeHttpHandler(async (_req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.status(200).json({ message: 'example' });
  });
}
