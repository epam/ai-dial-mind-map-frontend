import { EMPTY, filter, map, switchMap } from 'rxjs';

import { ChatRootEpic } from '@/types/store';
import { normalizeNavigationHistory } from '@/utils/chat/navigationHistory';

import { ConversationSelectors } from '../../conversation/conversation.reducers';
import { MindmapActions } from '../../mindmap/mindmap.reducers';
import { PlaybackActions, PlaybackSelectors } from '../playback.reducer';

export const robotMessagePostStreamEpic: ChatRootEpic = (action$, state$) =>
  action$.pipe(
    filter(PlaybackActions.streamBotMessageSuccess.match),
    map(() => ({
      playbackActions: ConversationSelectors.selectPlaybackActions(state$.value),
      playbackStepNumber: PlaybackSelectors.selectStepNumber(state$.value),
    })),
    switchMap(({ playbackActions, playbackStepNumber }) => {
      const currentAction = playbackActions?.[playbackStepNumber];
      if (!currentAction) {
        return EMPTY;
      }
      return [
        MindmapActions.setVisitedNodes(
          normalizeNavigationHistory(
            currentAction.mindmap.visitedNodes,
            currentAction.mindmap.focusNodeId ?? '',
          ),
        ),
        MindmapActions.setGraphElements(currentAction.mindmap.elements),
        MindmapActions.setFocusNodeId(currentAction.mindmap.focusNodeId),
        MindmapActions.setDepth(currentAction.mindmap.depth || 2),
        PlaybackActions.setPlaybackInputText(null),
        PlaybackActions.setBotStreaming({ isStreaming: false }),
      ];
    }),
  );
