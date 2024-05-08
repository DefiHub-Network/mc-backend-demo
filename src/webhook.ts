import * as crypto from 'crypto';
import { Request, Response } from 'express';

/**
 * Normalizes the request body by sorting the keys and converting it to a string.
 * This is necessary because objects in JavaScript are unordered key-value pairs (maps),
 * and the order of fields is not guaranteed. Normalizing the body ensures consistent
 * signature verification regardless of the field order.
 *
 * Note: In some programming languages like Go, the order of fields in a struct is
 * guaranteed, so normalizing the body might not be necessary. However, in JavaScript,
 * this step is crucial for accurate signature verification.
 *
 * @param obj The request body object
 * @returns The normalized request body as a string
 */
export function normalizeBody(obj: Record<string, any>): string {
  const orderedKeys = Object.keys(obj).sort();
  const orderedObj: any = {};
  for (const key of orderedKeys) {
    orderedObj[key] = obj[key];
  }
  return JSON.stringify(orderedObj);
}

/**
 * Verifies the signature of the webhook request to ensure its authenticity.
 * Merchants should use this function to validate incoming webhook requests.
 *
 * @param req The incoming webhook request
 * @param secretKey The merchant's secret key for signature verification
 * @returns True if the signature is valid, false otherwise
 */
export function verifySignature(req: Request, secretKey: string): boolean {
  // Get the received signature from the 'defihub-signature' header
  const receivedSignature = req.headers['defihub-signature'] as string;

  // Get the timestamp from the 'defihub-timestamp' header
  const timestamp = req.headers['defihub-timestamp'] as string;

  // Normalize the request body by combining the timestamp and request body
  const payload = normalizeBody({
    timestamp: timestamp,
    ...req.body,
  });

  // Calculate the expected signature using the merchant's secret key
  const calculatedSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  // Compare the received signature with the calculated signature
  return calculatedSignature === receivedSignature;
}
