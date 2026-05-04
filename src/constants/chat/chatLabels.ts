import { ChatInputPlaceholder } from '@/constants/app';
import {
  DefaultGraphLevelSwitcherDepth1Label,
  DefaultGraphLevelSwitcherDepth2Label,
} from '@/constants/chat/graphLevelSwitcher';

export const DEFAULT_CHAT_LABELS = {
  inputPlaceholder: ChatInputPlaceholder,
  regenerateResponseTooltip: 'Regenerate response',
  showMap: 'Show map',
  hideMap: 'Hide map',
  reset: 'Reset',
  resetHistory: 'Reset history',
  graphUnavailableTitle: 'Mindmap is not available.',
  graphUnavailableDescription: 'Please generate the graph.',
  rootNodeNotSetTitle: 'Root node not set.',
  rootNodeNotSetDescription: 'Please configure a root node for your mindmap.',
  referenceHeaderPrefix: 'Reference:',
  feedbackFieldLabel: 'Response feedback',
  feedbackPlaceholder: 'Enter response feedback',
  feedbackModalHeading: 'Response feedback',
  feedbackModalDescription:
    "Since the response didn't meet your expectations, please share your feedback so we can improve.",
  feedbackModalCancel: 'Cancel',
  feedbackModalConfirm: 'Confirm',
  tryAi: 'Try AI',
  tryAiTooltipTemplate: 'Content of "{nodeLabel}"',
  retry: 'Retry',
  reactionLikeAriaLabel: 'Like',
  reactionDislikeAriaLabel: 'Dislike',
  graphDepth1Label: DefaultGraphLevelSwitcherDepth1Label,
  graphDepth2Label: DefaultGraphLevelSwitcherDepth2Label,
} as const;

export type ChatLabelKey = keyof typeof DEFAULT_CHAT_LABELS;

export type ChatLabelsResolved = { [K in ChatLabelKey]: string };
