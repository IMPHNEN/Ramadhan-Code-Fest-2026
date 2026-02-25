import { Request, Response } from 'express';
import { menuService } from '../services/menu-service';

export const createMenu = async (req: Request, res: Response) => {
  try {
    const newMenu = await menuService.createMenu(req.body);
    res.status(201).json({
      statusCode: 201,
      message: 'Menu created successfully',
      data: newMenu,
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

export const getMenus = async (req: Request, res: Response) => {
  const menus = await menuService.getAllMenus();
  res.status(200).json({
    statusCode: 200,
    message: 'success',
    data: menus,
  });
};

export const findMenu = async (req: Request, res: Response) => {
  const { id } = req.params;
  const menu = await menuService.findMenuById(id);
  res.status(200).json({
    statusCode: 200,
    message: 'success',
    data: menu,
  });
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await menuService.deleteMenu(id);
    res.status(200).json({
      statusCode: 200,
      message: 'Menu deleted successfully',
    });
  } catch (error: unknown) {
    res.status(400).json({
      statusCode: 400,
      message: 'Failed to delete menu',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};
