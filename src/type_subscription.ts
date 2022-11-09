import * as vscode from "vscode";

import { VimState } from "./vim_state_types";

export function addTypeSubscription(
  vimState: VimState,
  typeHandler: (vimState: VimState, char: string) => void
): void {
  vimState.typeSubscription = vscode.commands.registerCommand("type", e => {
    typeHandler(vimState, e.text);
  });
}

export function removeTypeSubscription(vimState: VimState): void {
  if (vimState.typeSubscription) {
    vimState.typeSubscription.dispose();
  }
}
