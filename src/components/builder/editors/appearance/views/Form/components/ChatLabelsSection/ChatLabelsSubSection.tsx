import { useCallback } from 'react';

import { type ChatLabelKey,DEFAULT_CHAT_LABELS } from '@/constants/chat/chatLabels';
import { AppearanceActions, AppearanceSelectors } from '@/store/builder/appearance/appearance.reducers';
import { useBuilderDispatch, useBuilderSelector } from '@/store/builder/hooks';
import { UISelectors } from '@/store/builder/ui/ui.reducers';
import type { ChatLabels, ThemeConfig } from '@/types/customization';

import type { ChatLabelFormSection } from '../../data/chatLabelFormConfig';

const inputClassName =
  'input-form peer mx-0 w-full max-w-[480px] text-sm hover:border-accent-primary focus:border-accent-primary';

const pruneLabels = (raw: Record<string, string | undefined>): ChatLabels | undefined => {
  const entries = Object.entries(raw).filter(([, v]) => typeof v === 'string' && v.trim().length > 0);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries.map(([k, v]) => [k, (v as string).trim()])) as ChatLabels;
};

export const ChatLabelsSubSection = ({ section }: { section: ChatLabelFormSection }) => {
  const dispatch = useBuilderDispatch();
  const theme = useBuilderSelector(UISelectors.selectTheme) || 'dark';
  const config = useBuilderSelector(AppearanceSelectors.selectThemeConfig);

  const persistKey = useCallback(
    (key: ChatLabelKey, raw: string) => {
      if (!config) {
        return;
      }

      const prev = (config.chat?.labels ?? {}) as Record<string, string | undefined>;
      const next: Record<string, string | undefined> = { ...prev };

      if (!raw.trim()) {
        delete next[key];
      } else {
        next[key] = raw.trim();
      }

      const labels = pruneLabels(next);

      const updatedConfig: ThemeConfig = {
        ...config,
        chat: {
          ...config.chat,
          labels,
        },
      };

      dispatch(
        AppearanceActions.updateThemeConfig({
          theme,
          config: updatedConfig,
        }),
      );
    },
    [config, dispatch, theme],
  );

  return (
    <div className="flex flex-col gap-5">
      {section.fields.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1">
          <label htmlFor={`chat-label-${section.id}-${key}`} className="w-fit text-xs text-secondary">
            {label}
          </label>
          <input
            id={`chat-label-${section.id}-${key}`}
            value={config?.chat?.labels?.[key] ?? ''}
            placeholder={DEFAULT_CHAT_LABELS[key]}
            onChange={e => persistKey(key, e.target.value)}
            className={inputClassName}
          />
        </div>
      ))}
    </div>
  );
};
