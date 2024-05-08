import * as crypto from 'crypto';
import { Request, Response } from 'express';

export function normalizeBody(obj: Record<string, any>): string {
  const orderedKeys = Object.keys(obj).sort();
  const orderedObj: any = {};
  for (const key of orderedKeys) {
    orderedObj[key] = obj[key];
  }
  return JSON.stringify(orderedObj);
}

export function verifySignature(req: Request, secretKey: string): boolean {
  const receivedSignature = req.headers['defihub-signature'] as string;
  const timestamp = req.headers['defihub-timestamp'] as string;
  const payload = normalizeBody({
    timestamp: timestamp,
    ...req.body,
  });

  const calculatedSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return calculatedSignature === receivedSignature;
}
