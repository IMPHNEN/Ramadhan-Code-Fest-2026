import Menu from '../models/menu-model';
import Recipe from '../models/recipe-model';
import { RecipeInput } from '../validations/recipe-validation';

class RecipeRepository {
  async create(recipeInput: RecipeInput, day: number, category: 'Sahur' | 'Buka') {
    const recipe = await new Recipe(recipeInput).save();

    let menu = await Menu.findOne({ day });

    if (!menu) {
      menu = await Menu.create({ day, sahur: [], buka: [] });
    }

    if (category === 'Sahur') {
      menu.sahur.push(recipe._id);
    } else {
      menu.buka.push(recipe._id);
    }

    await menu.save();

    return recipe;
  }

  async delete(id: string) {
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const menu = await Menu.findOne({ day: recipe.day });

    if (menu) {
      if (recipe.category === 'Sahur') {
        menu.sahur = menu.sahur.filter((item) => item.toString() !== recipe._id.toString());
      } else {
        menu.buka = menu.buka.filter((item) => item.toString() !== recipe._id.toString());
      }

      await menu.save();
    }

    return menu;
  }
}

export const recipeRepository = new RecipeRepository();
