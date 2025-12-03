import { loginRequestSchema, signupRequestSchema, UnauthorizedError } from 'shared-kernel';
import type { GetMeUseCase } from '../../application/GetMeUseCase';
import type { LoginUseCase } from '../../application/LoginUseCase';
import type { SignupUseCase } from '../../application/SignupUseCase';
import { safeHttpHandler } from './utils/safe-http-handler';

export class AccountsHttpController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  public signup = safeHttpHandler(async (req, res) => {
    const { email, name, password } = signupRequestSchema.parse(req.body);

    const result = await this.signupUseCase.execute({ email, name, passwordPlain: password });

    res.status(201).json({ userId: result.userId });
  });

  public login = safeHttpHandler(async (req, res) => {
    const { email, password } = loginRequestSchema.parse(req.body);

    const { accessToken } = await this.loginUseCase.execute({ email, passwordPlain: password });

    res.status(200).json({ accessToken });
  });

  public me = safeHttpHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.slice('Bearer '.length);

    const result = await this.getMeUseCase.execute({ token });

    res.status(200).json(result);
  });
}
