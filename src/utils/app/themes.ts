import { encodeAppNamePath } from './application';
import { isAbsoluteUrl } from './file';

export const getThemeIconUrl = (iconUrl: string) =>
  isAbsoluteUrl(iconUrl) ? iconUrl : `api/themes/image/${encodeURIComponent(iconUrl)}`;

export const getAppearanceFileUrl = (appName: string, theme: string, fileName: string) => {
  return `/api/mindmaps/${encodeAppNamePath(appName)}/appearances/themes/${theme}/storage/${encodeURIComponent(fileName)}`;
};
