import { type ChatLabelKey, type ChatLabelsResolved,DEFAULT_CHAT_LABELS } from '@/constants/chat/chatLabels';
import type { ThemeConfig } from '@/types/customization';

const firstNonEmpty = (...vals: (string | undefined)[]): string | undefined => {
  for (const v of vals) {
    const t = v?.trim();
    if (t) {
      return t;
    }
  }

  return undefined;
};

export const mergeChatLabels = (themeConfig?: ThemeConfig): ChatLabelsResolved => {
  const labels = themeConfig?.chat?.labels;
  const chat = themeConfig?.chat;
  const graph = themeConfig?.graph;

  const pick = (key: ChatLabelKey): string => {
    const fallback = DEFAULT_CHAT_LABELS[key];

    if (key === 'inputPlaceholder') {
      return firstNonEmpty(labels?.inputPlaceholder, chat?.placeholder) ?? fallback;
    }

    if (key === 'graphDepth1Label') {
      return firstNonEmpty(labels?.graphDepth1Label, graph?.levelSwitcher?.depth1Label) ?? fallback;
    }

    if (key === 'graphDepth2Label') {
      return firstNonEmpty(labels?.graphDepth2Label, graph?.levelSwitcher?.depth2Label) ?? fallback;
    }

    return firstNonEmpty(labels?.[key as keyof typeof labels]) ?? fallback;
  };

  const keys = Object.keys(DEFAULT_CHAT_LABELS) as ChatLabelKey[];

  return Object.fromEntries(keys.map(k => [k, pick(k)])) as ChatLabelsResolved;
};
