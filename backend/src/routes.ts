import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { ItemController } from './controllers/item.controller';
import { PropostaController } from './controllers/proposta.controller';
import { UserController } from './controllers/user.controller';
import { CategoryController } from './controllers/category.controller';
import { RatingController } from './controllers/rating.controller';
import { authMiddleware, roleMiddleware } from './middlewares/auth.middleware';
import { authLimiter } from './middlewares/rateLimit.middleware';
import { UserRole } from './entities/User';
import { upload } from './middlewares/upload.middleware';

const router = Router();

// Instanciar controllers
const authController = new AuthController();
const itemController = new ItemController();
const propostaController = new PropostaController();
const userController = new UserController();
const categoryController = new CategoryController();
const ratingController = new RatingController();

// ==================== AUTH ROUTES ====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.get('/auth/me', authMiddleware, authController.me);

// ==================== CATEGORY ROUTES ====================
router.get('/categories', categoryController.index);
router.post('/categories', authMiddleware, roleMiddleware(UserRole.ADMIN), categoryController.create);

// ==================== ITEM ROUTES ====================
router.get('/items', itemController.index);
router.get('/items/:id', itemController.show);
router.post('/items', authMiddleware, itemController.create);
router.put('/items/:id', authMiddleware, itemController.update);
router.delete('/items/:id', authMiddleware, itemController.delete);
router.get('/items/my/items', authMiddleware, itemController.myItems);

router.post(
  '/items/:id/images',
  authMiddleware,
  upload.array('images', 5),
  itemController.uploadImages
);
router.delete('/items/:id/images', authMiddleware, itemController.removeImage);

// ==================== PROPOSTA ROUTES ====================
router.post('/propostas', authMiddleware, propostaController.create);
router.get('/propostas/received', authMiddleware, propostaController.received);
router.get('/propostas/sent', authMiddleware, propostaController.sent);
router.patch('/propostas/:id/status', authMiddleware, propostaController.updateStatus);
router.delete('/propostas/:id', authMiddleware, propostaController.delete);

// ==================== RATING ROUTES ====================
router.post('/ratings', authMiddleware, ratingController.create);
router.get('/users/:id/ratings', ratingController.getUserRatings);


// ==================== USER ROUTES (ADMIN ONLY) ====================
router.get('/users', authMiddleware, roleMiddleware(UserRole.ADMIN), userController.index);
router.get('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), userController.show);
router.put('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), userController.update);
router.delete('/users/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), userController.delete);

export { router };