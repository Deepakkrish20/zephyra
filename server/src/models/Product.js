import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    images: { type: [String], default: [] },
    category: { type: String, default: 'Uncategorized' },
    stock: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'hidden'],
      default: 'draft',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Product', ProductSchema);
