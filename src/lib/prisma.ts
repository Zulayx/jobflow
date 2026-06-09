import { PrismaClient } from "@prisma/client";

declare const globalThis: {
  prisma: PrismaClient;
} & typeof global;

function getPrismaClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  return globalThis.prisma;
}

// Proxy defers PrismaClient creation until first property access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    return (client as any)[property];
  },
});
