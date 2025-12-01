import { signupRequestSchema } from 'shared-kernel';
import type { SignupUseCase } from '../../application/SignupUseCase';

import { safeHttpHandler } from './utils/safe-http-handler';

export class AccountsHttpController {
  constructor(private readonly signupUseCase: SignupUseCase) {}

  public signup = safeHttpHandler(async (req, res) => {
    const { email, name, password } = signupRequestSchema.parse(req.body);

    const result = await this.signupUseCase.execute({ email, name, passwordPlain: password });

    res.status(201).json({ userId: result.userId });
  });

  public login = safeHttpHandler(async (_req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    res.status(501).json({ message: 'Not implemented' });
  });

  public me = safeHttpHandler(async (_req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    res.status(501).json({ message: 'Not implemented' });
  });
}
