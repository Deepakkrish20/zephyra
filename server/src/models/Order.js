import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 }
      }
    ],
    deliveryAgent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'assigned', 'in-transit', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Order', OrderSchema);
