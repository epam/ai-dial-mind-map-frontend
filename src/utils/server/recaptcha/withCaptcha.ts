import { NextRequest, NextResponse } from 'next/server';

import {
  AnonymSessionCookieName,
  AnonymSessionCSRFTokenHeaderName,
  AnonymSessionDataCookieName,
} from '@/constants/http';
import { CaptchaToken } from '@/types/common';
import { AnonymUserSession, AnonymUserSessionData } from '@/types/http';

import { getCsrfToken } from '../../common/csrf';
import { decryptNode, encryptNode } from '../crypt';
import { logger } from '../logger';
import { RecaptchaValidator } from './recaptchaValidator';

export function withCaptcha<T = unknown>(handler: (req: NextRequest, context: T, body: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: T, body: any) => {
    if (!process.env.DIAL_API_KEY || !process.env.RECAPTCHA_SITE_KEY || !process.env.ANONYM_SESSION_SECRET_KEY) {
      return await handler(req, context, body);
    }

    const ANONYM_SESSION_SECRET_KEY = process.env.ANONYM_SESSION_SECRET_KEY ?? '';
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? '';
    const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY ?? '';
    const RECAPTCHA_SCORE_THRESHOLD = process.env.RECAPTCHA_SCORE_THRESHOLD
      ? Number(process.env.RECAPTCHA_SCORE_THRESHOLD)
      : undefined;
    const RECAPTCHA_REQUEST_QUOTA = process.env.RECAPTCHA_REQUEST_QUOTA
      ? Number(process.env.RECAPTCHA_REQUEST_QUOTA)
      : 1;

    const sessionCookie = req.cookies.get(AnonymSessionCookieName);

    if (!sessionCookie) {
      logger.debug('User session cookie not received');
      return NextResponse.json({ error: 'Failed. Session not found.' }, { status: 400 });
    }

    let decrypted = '';
    try {
      decrypted = decryptNode(sessionCookie.value, ANONYM_SESSION_SECRET_KEY) ?? '';
    } catch (error) {
      logger.error(
        {
          error: error,
          value: sessionCookie.value,
        },
        `Error happened during session cookie decryption`,
      );
    }

    if (!decrypted) {
      logger.debug("User session cookie isn't correct. Can't decrypt.");
      return NextResponse.json({ error: 'Failed. Invalid session.' }, { status: 400 });
    }

    const session = JSON.parse(decrypted) as AnonymUserSession;
    const headerToken = req.headers.get(AnonymSessionCSRFTokenHeaderName) ?? '';

    const isTokenValid = !!headerToken && (headerToken === session.token || headerToken === session.prevToken);

    if (!isTokenValid) {
      logger.warn(
        {
          hasHeaderToken: Boolean(headerToken),
          matchesCurrent: headerToken === session.token,
          matchesPrev: headerToken === session.prevToken,
        },
        "CSRF token doesn't match",
      );
      return NextResponse.json({ error: 'Failed. Invalid security token.' }, { status: 400 });
    }

    let isNextRecaptchaRequired = false;

    const { captchaToken } = body as CaptchaToken;

    if (captchaToken && GCP_PROJECT_ID && RECAPTCHA_SITE_KEY) {
      const validator = new RecaptchaValidator(GCP_PROJECT_ID, RECAPTCHA_SITE_KEY, RECAPTCHA_SCORE_THRESHOLD);
      const isTokenValid = await validator.validateToken(captchaToken);

      if (!isTokenValid) {
        return NextResponse.json({ error: 'Failed. Invalid captcha token.' }, { status: 400 });
      }

      session.requestQuota = RECAPTCHA_REQUEST_QUOTA;
    } else if (session.requestQuota && session.requestQuota > 0) {
      session.requestQuota -= 1;
    } else {
      logger.warn(
        {
          hasCaptchaToken: !!captchaToken,
          hasRequestQuota: !!session.requestQuota,
          hitRequestLimit: !!session.requestQuota && session.requestQuota < 1,
        },
        'Empty captcha token and request quota',
      );
      return NextResponse.json({ error: 'Failed. Request quota exceeded.' }, { status: 400 });
    }

    if (session.requestQuota === 0) {
      isNextRecaptchaRequired = true;
    }

    try {
      const response = await handler(req, context, body);

      const nextToken = getCsrfToken();
      const nextPrevToken = session.token;
      session.prevToken = nextPrevToken;
      session.token = nextToken;

      const anonymSessionData: AnonymUserSessionData = {
        token: session.token,
        isChallengeRequired: isNextRecaptchaRequired,
      };
      response.cookies.set(AnonymSessionDataCookieName, JSON.stringify(anonymSessionData), {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        partitioned: true,
        httpOnly: false,
      });

      const encryptedSession = encryptNode(JSON.stringify(session), ANONYM_SESSION_SECRET_KEY);
      response.cookies.set(AnonymSessionCookieName, encryptedSession, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        partitioned: true,
        httpOnly: true,
      });

      return response;
    } catch (error) {
      logger.warn(`Error in withCaptcha middleware:`, error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}
