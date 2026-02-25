import { menuSchema } from '../validations/menu-validation';
import { menuRepository } from '../repositories/menu-repository';

class MenuService {
  async createMenu(data: unknown) {
    const parsedData = menuSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error(parsedData.error.errors.map((err) => err.message).join(', '));
    }

    return await menuRepository.create(parsedData.data);
  }

  async getAllMenus() {
    return await menuRepository.findAll();
  }

  async findMenuById(id: string) {
    return await menuRepository.find(id);
  }

  async deleteMenu(id: string) {
    return await menuRepository.delete(id);
  }
}

export const menuService = new MenuService();
