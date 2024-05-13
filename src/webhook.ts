import * as crypto from 'crypto';
import { Request } from 'express';

/**
 * Creates a signing message by combining the timestamp and the stringified request body.
 * @param body - The request body object.
 * @param timestamp - The timestamp string.
 * @returns The signing message string.
 */
export function createSigningMessage(body: object, timestamp: string): string {
  return `v0:${timestamp}:${JSON.stringify(body)}`;
}

/**
 * Signs the given message using the provided secret key and returns the signature.
 * @param message - The message to be signed.
 * @param secretKey - The secret key used for signing.
 * @returns The signature string.
 */
export function signSignature(message: string, secretKey: string): string {
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  return signature;
}

/**
 * Creates a signature by combining the signing message and the secret key.
 * @param body - The request body object.
 * @param timestamp - The timestamp string.
 * @param secretKey - The secret key used for signing.
 * @returns The signature string.
 */
export function createSignature(body: object, timestamp: string, secretKey: string): string {
  const message = createSigningMessage(body, timestamp);
  // v0:1715654020:{"eventId":"0c9a7e95-84b8-4090-aaff-a828eed69c56","type":"order.paid","payload":{"orderId":17,"status":"PAID","externalId":"89517dea-d882-44b9-ab9f-ecd04ab6bb9e","customData":"","currencyCode":"TON","paySUAmount":"10000000","feeSUAmount":"0","netSUAmount":"10000000","completedAt":"2024-05-13T15:16:40.000Z"}}
  return `v0=${signSignature(message, secretKey)}`;
}

/**
 * Verifies the signature of the incoming request by comparing it with the calculated signature.
 * @param req - The incoming request object.
 * @param secretKey - The secret key used for signature verification.
 * @returns True if the signature is valid, false otherwise.
 */
export function verifySignature(req: Request, secretKey: string): boolean {
  const receivedSignature = req.headers['x-defihub-signature'] as string;
  const timestamp = req.headers['x-defihub-timestamp'] as string;

  const calculatedSignature = createSignature(req.body, timestamp, secretKey);
  // v0=ea029e29987363ca54b41638baabd8d183d7679ca2856816493355f014d941b8
  return calculatedSignature === receivedSignature;
}
