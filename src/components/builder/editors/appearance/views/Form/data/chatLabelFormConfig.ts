import type { ChatLabelKey } from '@/constants/chat/chatLabels';

export type ChatLabelFormField = { key: ChatLabelKey; label: string };

export type ChatLabelFormSection = { title: string; fields: ChatLabelFormField[] };

export const CHAT_LABEL_FORM_SECTIONS: ChatLabelFormSection[] = [
  {
    title: 'Chat input',
    fields: [
      { key: 'inputPlaceholder', label: 'Input placeholder' },
      { key: 'regenerateResponseTooltip', label: 'Regenerate response (tooltip)' },
    ],
  },
  {
    title: 'Toolbar',
    fields: [
      { key: 'showMap', label: 'Show map' },
      { key: 'hideMap', label: 'Hide map' },
      { key: 'reset', label: 'Reset' },
    ],
  },
  {
    title: 'Mobile menu',
    fields: [{ key: 'resetHistory', label: 'Reset history' }],
  },
  {
    title: 'Graph level switcher',
    fields: [
      { key: 'graphDepth1Label', label: 'Depth 1 button' },
      { key: 'graphDepth2Label', label: 'Depth 2 button' },
    ],
  },
  {
    title: 'Graph empty states',
    fields: [
      { key: 'graphUnavailableTitle', label: 'Mindmap unavailable (title)' },
      { key: 'graphUnavailableDescription', label: 'Mindmap unavailable (description)' },
      { key: 'rootNodeNotSetTitle', label: 'Root node not set (title)' },
      { key: 'rootNodeNotSetDescription', label: 'Root node not set (description)' },
    ],
  },
  {
    title: 'References',
    fields: [{ key: 'referenceHeaderPrefix', label: 'Reference header prefix' }],
  },
  {
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
    title: 'Message actions',
    fields: [
      { key: 'tryAi', label: 'Try AI' },
      { key: 'retry', label: 'Retry' },
    ],
  },
  {
    title: 'Reactions',
    fields: [
      { key: 'reactionLikeAriaLabel', label: 'Like (accessible name)' },
      { key: 'reactionDislikeAriaLabel', label: 'Dislike (accessible name)' },
    ],
  },
];
