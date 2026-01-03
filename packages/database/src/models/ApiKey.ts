import mongoose, { Schema, Document, Types } from 'mongoose';
import type { Permission } from '@scrapepilot/shared';

export interface IApiKey extends Document {
  userId: Types.ObjectId;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: Permission[];
  isActive: boolean;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      enum: ['scrape', 'search', 'map', 'crawl'],
      default: ['scrape', 'search', 'map', 'crawl'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
