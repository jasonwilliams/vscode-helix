import * as vscode from 'vscode';

import { actions } from './actions';
import { HelixState } from './helix_state_types';
import { Mode } from './modes_types';
import { ParseKeysStatus } from './parse_keys_types';

export function typeHandler(helixState: HelixState, char: string): void {
  if (helixState.mode === Mode.SearchInProgress) {
    helixState.searchState.addChar(helixState, char);
    return;
  }
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  helixState.keysPressed.push(char);

  try {
    let could = false;
    for (const action of actions) {
      const result = action(helixState, helixState.keysPressed, editor);

      if (result === ParseKeysStatus.YES) {
        helixState.keysPressed = [];
        break;
      } else if (result === ParseKeysStatus.MORE_INPUT) {
        could = true;
      }
    }

    if (!could) {
      helixState.keysPressed = [];
    }
  } catch (error) {
    console.error(error);
  }
}
