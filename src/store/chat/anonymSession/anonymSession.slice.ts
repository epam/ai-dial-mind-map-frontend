import { createSlice } from '@reduxjs/toolkit';

import * as AnonymSessionSelectors from './anonymSession.selectors';
export { AnonymSessionSelectors };

export interface AnonymSessionState {
  recaptchaSiteKey: string;
  isRecaptchaConfigured: boolean;
}

const initialState: AnonymSessionState = {
  recaptchaSiteKey: '',
  isRecaptchaConfigured: false,
};

const anonymSessionSlice = createSlice({
  name: 'anonymSession',
  initialState,
  reducers: {},
});

export const anonymSessionActions = anonymSessionSlice.actions;
export default anonymSessionSlice.reducer;
