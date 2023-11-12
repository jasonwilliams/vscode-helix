import * as vscode from 'vscode';

import { HelixState } from './helix_state_types';

export function addTypeSubscription(
  vimState: HelixState,
  typeHandler: (vimState: HelixState, char: string) => void,
): void {
  vimState.typeSubscription = vscode.commands.registerCommand('type', (e) => {
    typeHandler(vimState, e.text);
  });
}

export function removeTypeSubscription(vimState: HelixState): void {
  if (vimState.typeSubscription) {
    vimState.typeSubscription.dispose();
  }
}
