import { Router } from 'express';
import { TokenController } from '../controllers/TokenController';

const router = Router();
const tokenController = new TokenController();

router.post('/generate', tokenController.generateTestToken.bind(tokenController));
router.get('/generate', (req, res) => {
  const tokenController = new TokenController();
  return tokenController.generateTestToken(req, res);
});

export default router;