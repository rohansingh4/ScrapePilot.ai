import mongoose, { Schema, Document, Types } from 'mongoose';
import type { PageMetadata, Performance } from '@scrapepilot/shared';

export interface IScrapeResult extends Document {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  text: string;
  markdown?: string;
  data?: Record<string, unknown>;
  screenshot?: string;
  pdf?: string;
  metadata: PageMetadata;
  performance: Performance;
  createdAt: Date;
}

const scrapeResultSchema = new Schema<IScrapeResult>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'ScrapeJob',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    finalUrl: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    html: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    markdown: String,
    data: Schema.Types.Mixed,
    screenshot: String,
    pdf: String,
    metadata: {
      title: {
        type: String,
        default: '',
      },
      description: String,
      language: String,
      links: {
        type: [String],
        default: [],
      },
      images: {
        type: [String],
        default: [],
      },
    },
    performance: {
      loadTime: {
        type: Number,
        default: 0,
      },
      renderTime: Number,
      size: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: delete after 7 days
scrapeResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const ScrapeResult = mongoose.model<IScrapeResult>('ScrapeResult', scrapeResultSchema);
