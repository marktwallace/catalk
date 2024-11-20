// src/types.d.ts
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    publicKey?: string;
  }
}
