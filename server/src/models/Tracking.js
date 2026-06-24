import mongoose from 'mongoose';

const TrackingSchema = new mongoose.Schema(
  {
    order: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    agent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    locationLog: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    status: { 
      type: String, 
      enum: ['active', 'completed'], 
      default: 'active' 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Tracking', TrackingSchema);
