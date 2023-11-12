import * as vscode from 'vscode';

import { Mode } from './modes_types';
import { HelixState } from './helix_state_types';

export function enterInsertMode(vimState: HelixState): void {
  vimState.mode = Mode.Insert;
  setModeContext('extension.helixKeymap.insertMode');
}

export function enterNormalMode(vimState: HelixState): void {
  vimState.mode = Mode.Normal;
  setModeContext('extension.helixKeymap.normalMode');
}

export function enterVisualMode(vimState: HelixState): void {
  vimState.mode = Mode.Visual;
  setModeContext('extension.helixKeymap.visualMode');
}

export function enterVisualLineMode(vimState: HelixState): void {
  vimState.mode = Mode.VisualLine;
  setModeContext('extension.helixKeymap.visualLineMode');
}

export function enterOccurrenceMode(vimState: HelixState): void {
  vimState.mode = Mode.Occurrence;
  setModeContext('extension.helixKeymap.occurrenceMode');
}

function setModeContext(key: string) {
  const modeKeys = [
    'extension.helixKeymap.insertMode',
    'extension.helixKeymap.normalMode',
    'extension.helixKeymap.visualMode',
    'extension.helixKeymap.visualLineMode',
    'extension.helixKeymap.occurrenceMode',
  ];

  modeKeys.forEach((modeKey) => {
    vscode.commands.executeCommand('setContext', modeKey, key === modeKey);
  });
}

export function setModeCursorStyle(mode: Mode, editor: vscode.TextEditor): void {
  if (mode === Mode.Insert || mode === Mode.Occurrence) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Line;
  } else if (mode === Mode.Normal) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
  } else if (mode === Mode.Visual || mode === Mode.VisualLine) {
    editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
  }
}
