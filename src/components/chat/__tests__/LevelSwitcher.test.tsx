import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import type { TypedUseSelectorHook } from 'react-redux';

import {
  DefaultGraphLevelSwitcherDepth1Label,
  DefaultGraphLevelSwitcherDepth2Label,
} from '@/constants/chat/graphLevelSwitcher';
import { AppearanceSelectors } from '@/store/chat/appearance/appearance.reducers';
import { ConversationSelectors } from '@/store/chat/conversation/conversation.reducers';
import { useChatDispatch, useChatSelector } from '@/store/chat/hooks';
import { MindmapActions, MindmapSelectors } from '@/store/chat/mindmap/mindmap.reducers';
import { PlaybackSelectors } from '@/store/chat/playback/playback.selectors';
import type { ThemeConfig } from '@/types/customization';
import { mergeChatLabels } from '@/utils/chat/mergeChatLabels';

import { LevelSwitcher } from '../LevelSwitcher';

jest.mock('@/store/chat/hooks');

const typedUseChatSelector: jest.MockedFunction<TypedUseSelectorHook<unknown>> = useChatSelector as jest.MockedFunction<
  TypedUseSelectorHook<unknown>
>;
const typedUseChatDispatch = useChatDispatch as jest.MockedFunction<typeof useChatDispatch>;

describe('LevelSwitcher', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    typedUseChatDispatch.mockReturnValue(mockDispatch);
    typedUseChatSelector.mockImplementation(selector => {
      switch (selector) {
        case MindmapSelectors.selectDepth:
          return 2;
        case PlaybackSelectors.selectIsPlayback:
          return false;
        case MindmapSelectors.selectRelayoutInProgress:
          return false;
        case ConversationSelectors.selectIsMessageStreaming:
          return false;
        case AppearanceSelectors.selectMergedChatLabels:
          return mergeChatLabels(undefined);
        default:
          return undefined;
      }
    });
  });

  it('renders default labels when appearance has no overrides', () => {
    render(<LevelSwitcher />);
    expect(screen.getByRole('button', { name: DefaultGraphLevelSwitcherDepth1Label })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DefaultGraphLevelSwitcherDepth2Label })).toBeInTheDocument();
  });

  it('renders custom labels from theme graph.levelSwitcher', () => {
    typedUseChatSelector.mockImplementation(selector => {
      switch (selector) {
        case MindmapSelectors.selectDepth:
          return 1;
        case PlaybackSelectors.selectIsPlayback:
          return false;
        case MindmapSelectors.selectRelayoutInProgress:
          return false;
        case ConversationSelectors.selectIsMessageStreaming:
          return false;
        case AppearanceSelectors.selectMergedChatLabels:
          return mergeChatLabels({
            graph: {
              paletteSettings: { branchesColors: [{ bgColor: '#000' }] },
              cytoscapeStyles: { node: {} },
              levelSwitcher: { depth1Label: 'Near', depth2Label: 'Far' },
            },
            references: {
              badge: {
                backgroundColor: { default: '#fff', hovered: '#fff', selected: '#fff' },
                textColor: { default: '#000', hovered: '#000', selected: '#000' },
              },
            },
          } as ThemeConfig);
        default:
          return undefined;
      }
    });

    render(<LevelSwitcher />);
    expect(screen.getByRole('button', { name: 'Near' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Far' })).toBeInTheDocument();
  });

  it('dispatches depth change when switching to depth 1', () => {
    typedUseChatSelector.mockImplementation(selector => {
      switch (selector) {
        case MindmapSelectors.selectDepth:
          return 2;
        case PlaybackSelectors.selectIsPlayback:
          return false;
        case MindmapSelectors.selectRelayoutInProgress:
          return false;
        case ConversationSelectors.selectIsMessageStreaming:
          return false;
        case AppearanceSelectors.selectMergedChatLabels:
          return mergeChatLabels(undefined);
        default:
          return undefined;
      }
    });

    render(<LevelSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: DefaultGraphLevelSwitcherDepth1Label }));
    expect(mockDispatch).toHaveBeenCalledWith(MindmapActions.setDepth(1));
    expect(mockDispatch).toHaveBeenCalledWith(MindmapActions.fetchGraph());
  });
});
