import Menu from '../models/menu-model';
import { MenuInput } from '../validations/menu-validation';

class MenuRepository {
  async create(menuData: MenuInput) {
    const menu = new Menu(menuData);
    return await menu.save();
  }

  async findAll() {
    return await Menu.find();
  }

  async find(id: string) {
    const menu = await Menu.findById(id).populate('sahur').populate('buka');
    if (!menu) {
      throw new Error('Menu not found');
    }
  }

  async delete(id: string) {
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) {
      throw new Error('Menu not found');
    }
  }
}

export const menuRepository = new MenuRepository();
