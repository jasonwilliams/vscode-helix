import * as vscode from 'vscode';

import { commandLine } from './commandLine';
import { HelixState } from './helix_state_types';
import { enterNormalMode, setModeCursorStyle, setRelativeLineNumbers } from './modes';
import { Mode } from './modes_types';
import * as positionUtils from './position_utils';
import { typeHandler } from './type_handler';
import { addTypeSubscription } from './type_subscription';

export function escapeHandler(vimState: HelixState): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) return;

  if (vimState.mode === Mode.Insert || vimState.mode === Mode.Occurrence) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = positionUtils.left(selection.active);
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    addTypeSubscription(vimState, typeHandler);
  } else if (vimState.mode === Mode.Normal) {
    // Clear multiple cursors
    if (editor.selections.length > 1) {
      editor.selections = [editor.selections[0]];
    }
    // There is no way to check if find widget is open, so just close it
    vscode.commands.executeCommand('closeFindWidget');
  } else if (vimState.mode === Mode.Visual) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = new vscode.Position(selection.active.line, Math.max(selection.active.character - 1, 0));
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  } else if (vimState.mode === Mode.VisualLine) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = selection.active.with({
        character: Math.max(selection.active.character - 1, 0),
      });
      return new vscode.Selection(newPosition, newPosition);
    });

    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  } else if (vimState.mode === Mode.SearchInProgress || vimState.mode === Mode.Select) {
    enterNormalMode(vimState);
    vimState.searchState.clearSearchString(vimState);
    // To match Helix UI go back to the last active position on escape
    if (vimState.searchState.lastActivePosition) {
      editor.selection = new vscode.Selection(
        vimState.searchState.lastActivePosition,
        vimState.searchState.lastActivePosition,
      );
      vimState.editorState.activeEditor?.revealRange(
        editor.selection,
        vscode.TextEditorRevealType.InCenterIfOutsideViewport,
      );
    }
  } else if (vimState.mode === Mode.View || vimState.mode === Mode.CommandlineInProgress) {
    commandLine.clearCommandString(vimState);
    enterNormalMode(vimState);
  }

  vimState.keysPressed = [];
}
