import * as vscode from 'vscode';

import { HelixState } from './helix_state_types';
import { Mode } from './modes_types';

export function enterInsertMode(helixState: HelixState): void {
  helixState.mode = Mode.Insert;
  setModeContext('extension.helixKeymap.insertMode');
  helixState.commandLine.setText('', helixState);
}

export function enterNormalMode(helixState: HelixState): void {
  helixState.mode = Mode.Normal;
  setModeContext('extension.helixKeymap.normalMode');
  helixState.commandLine.setText('', helixState);
}

export function enterSearchMode(helixState: HelixState): void {
  helixState.mode = Mode.SearchInProgress;
  setModeContext('extension.helixKeymap.searchMode');
  helixState.commandLine.setText('', helixState);
}

export function enterWindowMode(helixState: HelixState): void {
  helixState.mode = Mode.Window;
  setModeContext('extension.helixKeymap.windowMode');
  helixState.commandLine.setText('', helixState);
}

export function enterVisualMode(helixState: HelixState): void {
  helixState.mode = Mode.Visual;
  setModeContext('extension.helixKeymap.visualMode');
}

export function enterVisualLineMode(helixState: HelixState): void {
  helixState.mode = Mode.VisualLine;
  setModeContext('extension.helixKeymap.visualLineMode');
}

function setModeContext(key: string) {
  const modeKeys = [
    'extension.helixKeymap.insertMode',
    'extension.helixKeymap.normalMode',
    'extension.helixKeymap.visualMode',
    'extension.helixKeymap.visualLineMode',
    'extension.helixKeymap.searchMode',
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
