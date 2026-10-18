import { IconPlayerPlay } from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { BlinkingCursor } from '@/components/common/BlinkingCursor';
import { AppearanceSelectors } from '@/store/chat/appearance/appearance.reducers';
import { useChatSelector } from '@/store/chat/hooks';
import { ChatUISelectors, DeviceType } from '@/store/chat/ui/ui.reducers';

import { usePlayback } from './hooks/usePlayback';

export const PlaybackInput = () => {
  const { onNextPlaybackStep, onPreviousPlaybackStep, value, isPreviousStepDisabled, isNextStepDisabled, showCursor } =
    usePlayback();
  const labels = useChatSelector(AppearanceSelectors.selectMergedChatLabels);
  const placeholder = labels.inputPlaceholder;

  const deviceType = useChatSelector(ChatUISelectors.selectDeviceType);
  const isDesktop = deviceType === DeviceType.Desktop;
  const isTablet = deviceType === DeviceType.Tablet;
  const isMdUp = isTablet || isDesktop;

  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollLeft = textRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <div
      className={classNames(
        'chat-footer__input flex size-full items-end rounded-[3px] bg-layer-3 px-1',
        isMdUp ? 'min-h-[48px] py-[12px]' : 'min-h-11 py-[10px]',
      )}
    >
      <button
        type="button"
        onClick={onPreviousPlaybackStep}
        className={classNames(
          'flex size-6 items-center justify-center rounded transition-colors duration-200 hover:text-accent-primary',
          {
            'pointer-events-none text-controls-disable': isPreviousStepDisabled,
          },
        )}
        tabIndex={0}
        disabled={isPreviousStepDisabled}
      >
        <IconPlayerPlay size={24} className="rotate-180" />
      </button>

      <div
        className={classNames(
          'h-full flex-1 cursor-default bg-transparent px-3 text-base font-normal outline-hidden select-text',
          'max-h-[150px] content-center overflow-y-auto whitespace-pre-wrap',
          !value && 'text-controls-disable',
        )}
        ref={textRef}
      >
        <span className="h-full">{value || placeholder}</span>
        <BlinkingCursor isShowing={showCursor} />
      </div>

      <button
        type="button"
        onClick={onNextPlaybackStep}
        className={classNames(
          'flex size-6 items-center justify-center rounded transition-colors duration-200 hover:text-accent-primary',
          {
            'pointer-events-none text-controls-disable': isNextStepDisabled,
          },
        )}
        tabIndex={0}
        disabled={isNextStepDisabled}
      >
        <IconPlayerPlay size={24} />
      </button>
    </div>
  );
};
