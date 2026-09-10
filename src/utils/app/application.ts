import { Application } from '@/types/application';

// Application names coming from the DIAL API may already contain a percent-encoded
// segment (e.g. spaces stored as %20); decode that segment before the single
// encodeURIComponent pass below to avoid double-encoding (%20 -> %2520).
export const encodeAppNamePath = (name: string): string => {
  const [appSlug, bucketId, applicationName] = name.split('/');
  return encodeURIComponent(
    [appSlug, bucketId, applicationName ? decodeURIComponent(applicationName) : undefined]
      .filter(Boolean)
      .join('/'),
  );
};

export const getEncodedPathFromApplication = (application: Application): string =>
  encodeAppNamePath(application.name ?? application.application ?? '');

export const getAppPathWithEncodedAppName = (appId: string): string => {
  const [appSlug, bucketId, applicationName] = appId.split('/') ?? [];
  return [appSlug, bucketId, applicationName ? encodeURIComponent(applicationName) : undefined]
    .filter(Boolean)
    .join('/');
};

export const decodeAppPathSafely = (appPath: string): string =>
  getAppPathWithEncodedAppName(decodeURIComponent(appPath ?? ''));
