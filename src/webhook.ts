import * as crypto from 'crypto';
import { Request } from 'express';

export function createSigningMessage(body: object): string {
  return JSON.stringify(body);
}

export function signSignature(message: string, secretKey: string): string {
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  return signature;
}

export function createSignature(body: object, secretKey: string): string {
  const message = createSigningMessage(body);
  return signSignature(message, secretKey);
}

export function verifySignature(req: Request, secretKey: string): boolean {
  const receivedSignature = req.headers['x-defihub-signature'] as string;

  const calculatedSignature = createSignature(req.body, secretKey);
  return calculatedSignature === receivedSignature;
}
