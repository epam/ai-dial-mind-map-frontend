/** Messages the DIAL Chat Apps Editor (the host) posts into the embedded builder. */
export enum AppsEditorInboundMessage {
  TriggerSave = 'TRIGGER_SAVE',
}

/**
 * Messages the builder posts to the Apps Editor. `ReadyToSave`, `LoggedOut` and
 * `UpdatedApplicationSuccess` are sent as `${applicationName}/${type}`; the save
 * replies are flat.
 */
export enum AppsEditorOutboundMessage {
  ReadyToSave = 'readyToSave',
  LoggedOut = 'loggedOut',
  UpdatedApplicationSuccess = 'updatedApplicationSuccess',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',
}

/** Query params the host appends to the editor URL. */
export enum AppsEditorQuery {
  ApplicationName = 'applicationName',
}

export interface AppsEditorSaveSuccess {
  type: AppsEditorOutboundMessage.SaveSuccess;
  hasChanges: boolean;
}

export interface AppsEditorSaveError {
  type: AppsEditorOutboundMessage.SaveError;
  error: string;
}
