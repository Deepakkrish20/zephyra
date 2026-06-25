import mongoose from 'mongoose';
import ROLES from '../constants/roles.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // will be encrypted via bcrypt
    role: { 
      type: String, 
      enum: Object.values(ROLES), 
      default: ROLES.CUSTOMER 
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('User', UserSchema);
