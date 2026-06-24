import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    stock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Product', ProductSchema);
