import { Request, Response } from 'express';
import { recipeService } from '../services/recipe-service';

export const createRecipe = async (req: Request, res: Response) => {
  try {
    const { day, category } = req.body;
    const newRecipe = await recipeService.createRecipe(req.body, day, category);
    res.status(201).json({
      statusCode: 201,
      message: 'Recipe created successfully',
      data: newRecipe,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        statusCode: 400,
        message: 'failed',
        error: error.message,
      });
      return;
    }

    res.status(400).json({
      statusCode: 400,
      message: 'An unknown error occurred',
    });
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await recipeService.deleteRecipe(id);
    res.status(200).json({
      statusCode: 200,
      message: 'Recipe deleted successfully',
    });
  } catch (error: unknown) {
    res.status(400).json({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};
