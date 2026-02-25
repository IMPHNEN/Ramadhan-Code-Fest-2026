import mongoose, { Schema, Document } from 'mongoose';

interface IDailyMenu extends Document {
  day: number;
  sahur: mongoose.Types.ObjectId[];
  buka: mongoose.Types.ObjectId[];
}

const DailyMenuSchema = new Schema<IDailyMenu>(
  {
    day: { type: Number, required: true },
    sahur: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
    buka: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  { collection: 'daily-menus', timestamps: true },
);

export default mongoose.model<IDailyMenu>('DailyMenu', DailyMenuSchema);
