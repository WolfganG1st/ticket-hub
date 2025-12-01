import { Router } from 'express';
import { SignupUseCase } from '../../application/SignupUseCase';
import { DrizzleUserRepository } from '../persistence/DrizzleUserRepository';
import { db } from '../persistence/db';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { AccountsHttpController } from './AccountsHttpController';

export function buildAccountRouter(): Router {
  const router = Router();
  const userRepository = new DrizzleUserRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const signupUseCase = new SignupUseCase(userRepository, passwordHasher);
  const controller = new AccountsHttpController(signupUseCase);

  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  router.get('/me', controller.me);

  return router;
}
