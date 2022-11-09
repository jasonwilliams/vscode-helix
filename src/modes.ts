import * as vscode from "vscode";

import { Mode } from "./modes_types";
import { VimState } from "./vim_state_types";

export function enterInsertMode(vimState: VimState): void {
  vimState.mode = Mode.Insert;
  setModeContext("extension.simpleVim.insertMode");
}

export function enterNormalMode(vimState: VimState): void {
  vimState.mode = Mode.Normal;
  setModeContext("extension.simpleVim.normalMode");
}

export function enterVisualMode(vimState: VimState): void {
  vimState.mode = Mode.Visual;
  setModeContext("extension.simpleVim.visualMode");
}

export function enterVisualLineMode(vimState: VimState): void {
  vimState.mode = Mode.VisualLine;
  setModeContext("extension.simpleVim.visualLineMode");
}

export function enterOccurrenceMode(vimState: VimState): void {
  vimState.mode = Mode.Occurrence;
  setModeContext("extension.simpleVim.occurrenceMode");
}

function setModeContext(key: string) {
  const modeKeys = [
    "extension.simpleVim.insertMode",
    "extension.simpleVim.normalMode",
    "extension.simpleVim.visualMode",
    "extension.simpleVim.visualLineMode",
    "extension.simpleVim.occurrenceMode"
  ];

  modeKeys.forEach(modeKey => {
    vscode.commands.executeCommand("setContext", modeKey, key === modeKey);
  });
}

export function setModeCursorStyle(
  mode: Mode,
  editor: vscode.TextEditor
): void {
  if (mode === Mode.Insert || mode === Mode.Occurrence) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Line;
  } else if (mode === Mode.Normal) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
  } else if (mode === Mode.Visual || mode === Mode.VisualLine) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
  }
}
