import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ThemeConfig } from '@/types/customization';
import { mergeChatLabels } from '@/utils/chat/mergeChatLabels';

import { ChatRootState } from '..';

export interface AppearanceState {
  themeConfig?: ThemeConfig;
}

export const AppearanceInitialState: AppearanceState = {
  themeConfig: undefined,
};

export const appearanceSlice = createSlice({
  name: 'appearance',
  initialState: AppearanceInitialState,
  reducers: {
    setThemeConfig: (state, { payload }: PayloadAction<ThemeConfig>) => {
      state.themeConfig = payload;
    },
    fetchThemeConfig: state => state,
    subscribeOnTheme: state => state,
    initTheme: state => state,
  },
});

const rootSelector = (state: ChatRootState): AppearanceState => state.appearance;

const selectThemeConfig = createSelector([rootSelector], state => state.themeConfig);

const selectChatConfig = createSelector([rootSelector], state => state.themeConfig?.chat);

const selectMergedChatLabels = createSelector([selectThemeConfig], themeConfig => mergeChatLabels(themeConfig));

export const AppearanceActions = appearanceSlice.actions;

export const AppearanceSelectors = {
  selectThemeConfig,
  selectChatConfig,
  selectMergedChatLabels,
};
