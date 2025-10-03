import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { ItemController } from './controllers/item.controller';
import { PropostaController } from './controllers/proposta.controller';
import { UserController } from './controllers/user.controller';
import { authMiddleware, roleMiddleware } from './middlewares/auth.middleware';
import { UserRole } from './entities/User';
import { upload } from './middlewares/upload.middleware';

const router = Router();

// Instanciar controllers
const authController = new AuthController();
const itemController = new ItemController();
const propostaController = new PropostaController();
const userController = new UserController();

// ==================== AUTH ROUTES ====================
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.get('/auth/me', authMiddleware, (req, res) => authController.me(req, res));

// ==================== ITEM ROUTES ====================
// Rotas públicas
router.get('/items', (req, res) => itemController.index(req, res));
router.get('/items/:id', (req, res) => itemController.show(req, res));

// Rotas autenticadas
router.post('/items', authMiddleware, (req, res) => itemController.create(req, res));
router.put('/items/:id', authMiddleware, (req, res) => itemController.update(req, res));
router.delete('/items/:id', authMiddleware, (req, res) => itemController.delete(req, res));
router.get('/items/my/items', authMiddleware, (req, res) => itemController.myItems(req, res));

// Novas rotas para upload de imagens
router.post(
  '/items/:id/images',
  authMiddleware,
  upload.array('images', 5), // Máximo de 5 imagens por vez
  (req, res) => itemController.uploadImages(req, res)
);
router.delete(
  '/items/:id/images',
  authMiddleware,
  (req, res) => itemController.removeImage(req, res)
);

// ==================== PROPOSTA ROUTES ====================
router.post('/propostas', authMiddleware, (req, res) => propostaController.create(req, res));
router.get('/propostas/received', authMiddleware, (req, res) => propostaController.received(req, res));
router.get('/propostas/sent', authMiddleware, (req, res) => propostaController.sent(req, res));
router.patch('/propostas/:id/status', authMiddleware, (req, res) => propostaController.updateStatus(req, res));
router.delete('/propostas/:id', authMiddleware, (req, res) => propostaController.delete(req, res));

// ==================== USER ROUTES (ADMIN ONLY) ====================
router.get('/users', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) => userController.index(req, res));
router.get('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) => userController.show(req, res));
router.put('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) => userController.update(req, res));
router.delete('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), (req, res) => userController.delete(req, res));

export { router };
