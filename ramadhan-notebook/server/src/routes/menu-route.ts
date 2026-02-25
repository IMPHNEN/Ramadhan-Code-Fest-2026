import { Router } from 'express';
import { createMenu, deleteMenu, getMenus } from '../controllers/menu-controller';

const router = Router();

router.post('/', createMenu);
router.get('/', getMenus);
router.delete('/:id', deleteMenu);

export default router;
