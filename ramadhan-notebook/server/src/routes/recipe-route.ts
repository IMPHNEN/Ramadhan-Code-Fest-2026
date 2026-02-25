import { Router } from 'express';
import { createRecipe, deleteRecipe } from '../controllers/recipe-controller';

const router = Router();

router.post('/', createRecipe);
router.delete('/:id', deleteRecipe);

export default router;
