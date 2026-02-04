import { JWT } from 'next-auth/jwt';

import { logger } from '../server/logger';
import NextClient from './nextauth-client';

export const validateToken = async (token: JWT | null): Promise<{ error?: string }> => {
  if (!token || typeof token.providerId !== 'string') {
    logger.warn('Token is missing or providerId not found.');
    return { error: 'NoClientForProvider' };
  }

  const client = NextClient.getClient(token.providerId);
  if (!client) {
    logger.warn(`Client for providerId ${token.providerId} not found.`);
    return { error: 'NoClientForProvider' };
  }

  return {};
};
