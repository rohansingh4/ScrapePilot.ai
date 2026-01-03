import mongoose, { Schema, Document } from 'mongoose';
import type { Plan } from '@scrapepilot/shared';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  plan: Plan;
  credits: number;
  creditsResetAt: Date;
  rateLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
    },
    credits: {
      type: Number,
      default: 1000,
    },
    creditsResetAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    rateLimit: {
      type: Number,
      default: 10, // requests per minute
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
