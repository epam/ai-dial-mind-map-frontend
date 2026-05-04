import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ChatInputPlaceholder } from '@/constants/app';
import { AppearanceSelectors } from '@/store/chat/appearance/appearance.reducers';
import { useChatSelector } from '@/store/chat/hooks';
import { mergeChatLabels } from '@/utils/chat/mergeChatLabels';

import { usePlayback } from '../hooks/usePlayback';
import { PlaybackInput } from '../PlaybackInput';

jest.mock('../hooks/usePlayback');
jest.mock('@/store/chat/hooks');
jest.mock('@/components/common/BlinkingCursor', () => ({
  BlinkingCursor: () => <span data-testid="blinking-cursor" />,
}));

const mockedUsePlayback = usePlayback as jest.MockedFunction<typeof usePlayback>;
const mockedUseChatSelector = useChatSelector as jest.MockedFunction<typeof useChatSelector>;

describe('PlaybackInput', () => {
  const onPrev = jest.fn();
  const onNext = jest.fn();

  const mockLabels = (override?: Partial<ReturnType<typeof mergeChatLabels>>) => {
    mockedUseChatSelector.mockImplementation(selector => {
      if (selector === AppearanceSelectors.selectMergedChatLabels) {
        return { ...mergeChatLabels(undefined), ...override };
      }
      return undefined;
    });
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockLabels();
  });

  it('renders value and disables next button when isNextStepDisabled is true', () => {
    mockedUsePlayback.mockReturnValue({
      onNextPlaybackStep: onNext,
      onPreviousPlaybackStep: onPrev,
      value: 'hello playback',
      isPreviousStepDisabled: false,
      isNextStepDisabled: true,
      showCursor: true,
    });
    mockLabels({ inputPlaceholder: 'CUSTOM PH' });

    render(<PlaybackInput />);

    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0];
    const nextButton = buttons[1];

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeDisabled();

    expect(screen.getByText('hello playback')).toBeInTheDocument();

    expect(screen.getByTestId('blinking-cursor')).toBeInTheDocument();
  });

  it('renders placeholder when value is empty and buttons enabled', () => {
    mockedUsePlayback.mockReturnValue({
      onNextPlaybackStep: onNext,
      onPreviousPlaybackStep: onPrev,
      value: '',
      isPreviousStepDisabled: false,
      isNextStepDisabled: false,
      showCursor: false,
    });
    mockLabels();

    render(<PlaybackInput />);

    // Both buttons enabled
    const [prev, next] = screen.getAllByRole('button');
    expect(prev).toBeEnabled();
    expect(next).toBeEnabled();

    // Fallback placeholder from constant
    expect(screen.getByText(ChatInputPlaceholder)).toBeInTheDocument();

    // Cursor hidden: still rendered but showCursor=false
    expect(screen.getByTestId('blinking-cursor')).toBeInTheDocument();
  });

  it('calls playback handlers on button clicks', () => {
    mockedUsePlayback.mockReturnValue({
      onNextPlaybackStep: onNext,
      onPreviousPlaybackStep: onPrev,
      value: 'v',
      isPreviousStepDisabled: false,
      isNextStepDisabled: false,
      showCursor: false,
    });
    mockLabels({ inputPlaceholder: 'PH' });

    render(<PlaybackInput />);

    const [prev, next] = screen.getAllByRole('button');

    fireEvent.click(prev);
    fireEvent.click(next);

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
