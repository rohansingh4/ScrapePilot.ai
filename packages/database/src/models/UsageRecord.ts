import mongoose, { Schema, Document, Types } from 'mongoose';
import type { UsageByType, UsageByRenderMode } from '@scrapepilot/shared';

export interface IUsageRecord extends Document {
  userId: Types.ObjectId;
  apiKeyId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  timestamp: Date;
  requests: number;
  successful: number;
  failed: number;
  creditsUsed: number;
  byType: UsageByType;
  byRenderMode: UsageByRenderMode;
  createdAt: Date;
}

const usageRecordSchema = new Schema<IUsageRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: 'ApiKey',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    hour: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    requests: {
      type: Number,
      default: 0,
    },
    successful: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    creditsUsed: {
      type: Number,
      default: 0,
    },
    byType: {
      scrape: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      map: { type: Number, default: 0 },
      crawl: { type: Number, default: 0 },
    },
    byRenderMode: {
      http: { type: Number, default: 0 },
      browser: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
usageRecordSchema.index({ userId: 1, date: 1, hour: 1 });

// TTL index: delete after 90 days
usageRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const UsageRecord = mongoose.model<IUsageRecord>('UsageRecord', usageRecordSchema);
