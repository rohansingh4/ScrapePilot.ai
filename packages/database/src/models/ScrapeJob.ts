import mongoose, { Schema, Document, Types } from 'mongoose';
import type { JobType, JobStatus, JobConfig, JobMetrics, JobError } from '@scrapepilot/shared';

export interface IScrapeJob extends Document {
  userId: Types.ObjectId;
  apiKeyId: Types.ObjectId;
  type: JobType;
  url: string;
  config: JobConfig;
  status: JobStatus;
  progress: number;
  resultId?: Types.ObjectId;
  metrics: JobMetrics;
  error?: JobError;
  createdAt: Date;
  updatedAt: Date;
}

const scrapeJobSchema = new Schema<IScrapeJob>(
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
    type: {
      type: String,
      enum: ['scrape', 'search', 'map', 'crawl'],
      default: 'scrape',
    },
    url: {
      type: String,
      required: true,
    },
    config: {
      renderMode: {
        type: String,
        enum: ['http', 'browser'],
        default: 'http',
      },
      waitFor: {
        type: String,
        enum: ['load', 'domcontentloaded', 'networkidle'],
        default: 'load',
      },
      waitForSelector: String,
      timeout: {
        type: Number,
        default: 30000,
      },
      screenshot: {
        type: Boolean,
        default: false,
      },
      pdf: {
        type: Boolean,
        default: false,
      },
      extractSchema: Schema.Types.Mixed,
      headers: Schema.Types.Mixed,
      cookies: [
        {
          name: String,
          value: String,
          domain: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'ScrapeResult',
    },
    metrics: {
      queuedAt: {
        type: Date,
        default: Date.now,
      },
      startedAt: Date,
      completedAt: Date,
      duration: Number,
      creditsUsed: {
        type: Number,
        default: 0,
      },
      retries: {
        type: Number,
        default: 0,
      },
    },
    error: {
      code: String,
      message: String,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: delete after 30 days
scrapeJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ScrapeJob = mongoose.model<IScrapeJob>('ScrapeJob', scrapeJobSchema);
