import { Router } from 'express';
import menuRoutes from './menu-route';
import recipeRoutes from './recipe-route';

const router = Router();

router.use('/menus', menuRoutes);
router.use('/recipes', recipeRoutes);

export default router;
