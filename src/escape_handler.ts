import * as vscode from "vscode";

import { VimState } from "./vim_state_types";
import { enterNormalMode, setModeCursorStyle } from "./modes";
import { addTypeSubscription } from "./type_subscription";
import { typeHandler } from "./type_handler";
import * as positionUtils from "./position_utils";
import { Mode } from "./modes_types";

export function escapeHandler(vimState: VimState): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) return;

  if (vimState.mode === Mode.Insert || vimState.mode === Mode.Occurrence) {
    editor.selections = editor.selections.map(selection => {
      const newPosition = positionUtils.left(selection.active);
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    addTypeSubscription(vimState, typeHandler);
  } else if (vimState.mode === Mode.Normal) {
    // Clear multiple cursors
    if (editor.selections.length > 1) {
      editor.selections = [editor.selections[0]];
    }
  } else if (vimState.mode === Mode.Visual) {
    editor.selections = editor.selections.map(selection => {
      const newPosition = new vscode.Position(
        selection.active.line,
        Math.max(selection.active.character - 1, 0)
      );
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  } else if (vimState.mode === Mode.VisualLine) {
    editor.selections = editor.selections.map(selection => {
      const newPosition = selection.active.with({
        character: Math.max(selection.active.character - 1, 0)
      });
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }

  vimState.keysPressed = [];
}
