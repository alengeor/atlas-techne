import { ApiError } from '../api/client';
import type { Messages } from './messages';
export function apiMessage(error: unknown, t: Messages): string {
  if (!(error instanceof ApiError)) return t.serverError;
  switch (error.code) {
    case 'INVALID_CREDENTIALS': return t.invalidCredentials;
    case 'UNAUTHORIZED': return t.sessionExpired;
    case 'ADMIN_NOT_CONFIGURED': return t.adminNotConfigured;
    case 'TOO_MANY_ATTEMPTS': case 'TOO_MANY_UPLOADS': return t.rateLimited;
    case 'REVISION_CONFLICT': return t.conflict;
    case 'MISSING_TRANSLATIONS': return t.translationRequired;
    case 'INVALID_IMAGE': case 'BODY_TOO_LARGE': return t.invalidImage;
    case 'NETWORK_ERROR': return t.networkError;
    default: return t.serverError;
  }
}
