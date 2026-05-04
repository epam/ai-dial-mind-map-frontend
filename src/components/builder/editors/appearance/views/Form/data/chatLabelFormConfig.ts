import type { ChatLabelKey } from '@/constants/chat/chatLabels';

export type ChatLabelFormField = { key: ChatLabelKey; label: string };

export type ChatLabelFormSection = { id: string; title: string; fields: ChatLabelFormField[] };

export const CHAT_LABEL_FORM_SECTIONS: ChatLabelFormSection[] = [
  {
    id: 'chatLabelsInput',
    title: 'Chat input',
    fields: [
      { key: 'inputPlaceholder', label: 'Input placeholder' },
      { key: 'regenerateResponseTooltip', label: 'Regenerate response (tooltip)' },
    ],
  },
  {
    id: 'chatLabelsToolbar',
    title: 'Toolbar',
    fields: [
      { key: 'showMap', label: 'Show map' },
      { key: 'hideMap', label: 'Hide map' },
      { key: 'reset', label: 'Reset' },
    ],
  },
  {
    id: 'chatLabelsMobileMenu',
    title: 'Mobile menu',
    fields: [{ key: 'resetHistory', label: 'Reset history' }],
  },
  {
    id: 'chatLabelsGraphLevelSwitcher',
    title: 'Graph level switcher',
    fields: [
      { key: 'graphDepth1Label', label: 'Depth 1 button' },
      { key: 'graphDepth2Label', label: 'Depth 2 button' },
    ],
  },
  {
    id: 'chatLabelsGraphEmptyStates',
    title: 'Graph empty states',
    fields: [
      { key: 'graphUnavailableTitle', label: 'Mindmap unavailable (title)' },
      { key: 'graphUnavailableDescription', label: 'Mindmap unavailable (description)' },
      { key: 'rootNodeNotSetTitle', label: 'Root node not set (title)' },
      { key: 'rootNodeNotSetDescription', label: 'Root node not set (description)' },
    ],
  },
  {
    id: 'chatLabelsReferences',
    title: 'References',
    fields: [{ key: 'referenceHeaderPrefix', label: 'Reference header prefix' }],
  },
  {
    id: 'chatLabelsFeedback',
    title: 'Feedback',
    fields: [
      { key: 'feedbackModalHeading', label: 'Feedback modal title' },
      { key: 'feedbackModalDescription', label: 'Feedback modal description' },
      { key: 'feedbackFieldLabel', label: 'Feedback field label' },
      { key: 'feedbackPlaceholder', label: 'Feedback placeholder' },
      { key: 'feedbackModalCancel', label: 'Feedback modal — Cancel' },
      { key: 'feedbackModalConfirm', label: 'Feedback modal — Confirm' },
    ],
  },
  {
    id: 'chatLabelsMessageActions',
    title: 'Message actions',
    fields: [
      { key: 'tryAi', label: 'Try AI' },
      { key: 'retry', label: 'Retry' },
    ],
  },
  {
    id: 'chatLabelsReactions',
    title: 'Reactions',
    fields: [
      { key: 'reactionLikeAriaLabel', label: 'Like (accessible name)' },
      { key: 'reactionDislikeAriaLabel', label: 'Dislike (accessible name)' },
    ],
  },
];
