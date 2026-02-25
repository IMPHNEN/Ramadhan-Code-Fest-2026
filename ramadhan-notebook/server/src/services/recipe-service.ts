import { recipeSchema } from '../validations/recipe-validation';
import { recipeRepository } from '../repositories/recipe-repository';

class RecipeService {
  async createRecipe(data: unknown, day: number, category: 'Sahur' | 'Buka') {
    const parsedData = recipeSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error(parsedData.error.errors.map((err) => err.message).join(', '));
    }

    return await recipeRepository.create(parsedData.data, day, category);
  }

  async deleteRecipe(id: string) {
    return await recipeRepository.delete(id);
  }
}

export const recipeService = new RecipeService();
