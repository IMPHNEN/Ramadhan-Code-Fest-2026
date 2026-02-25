import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    description: { type: String },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    step_number: { type: Number, required: true },
    instruction: { type: String, required: true },
    description: { type: String },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    name: { type: String, required: true },
    ingredients: { type: [ingredientSchema], required: true },
    steps: { type: [stepSchema], required: true },
    category: { type: String, required: true },
  },
  { collection: 'recipes', timestamps: true },
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
