import type { AccountsEnv } from 'config';
import { Router } from 'express';
import { GetMeUseCase } from '../../application/GetMeUseCase';
import { LoginUseCase } from '../../application/LoginUseCase';
import { SignupUseCase } from '../../application/SignupUseCase';
import { DrizzleUserRepository } from '../persistence/DrizzleUserRepository';
import type { Db } from '../persistence/db';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenService } from '../security/JwtTokenService';
import { AccountsHttpController } from './AccountsHttpController';

export function buildAccountRouter(db: Db, env: AccountsEnv): Router {
  const router = Router();

  const userRepository = new DrizzleUserRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(env.ACCOUNTS_JWT_SECRET);

  const signupUseCase = new SignupUseCase(userRepository, passwordHasher);
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  const getMeUseCase = new GetMeUseCase(tokenService, userRepository);

  const controller = new AccountsHttpController(signupUseCase, loginUseCase, getMeUseCase);

  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  router.get('/me', controller.me);

  return router;
}
