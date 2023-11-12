import * as vscode from 'vscode';

import { Mode } from './modes_types';
import * as scrollCommands from './scroll_commands';
import { enterNormalMode } from './modes';
import { typeHandler } from './type_handler';
import { addTypeSubscription, removeTypeSubscription } from './type_subscription';
import { HelixState } from './helix_state_types';
import { escapeHandler } from './escape_handler';
import { onSelectionChange, onDidChangeActiveTextEditor, onDidChangeTextDocument } from './eventHandlers';

const globalhelixState: HelixState = {
  typeSubscription: undefined,
  mode: Mode.Insert,
  keysPressed: [],
  registers: {
    contentsList: [],
    linewise: true,
  },
  editorState: {
    activeEditor: undefined,
    previousEditor: undefined,
    lastModifiedDocument: undefined,
  },
  semicolonAction: () => undefined,
  commaAction: () => undefined,
  lastPutRanges: {
    ranges: [],
    linewise: true,
  },
};

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => onDidChangeActiveTextEditor(globalhelixState, editor)),
    vscode.window.onDidChangeTextEditorSelection((e) => onSelectionChange(globalhelixState, e)),
    vscode.workspace.onDidChangeTextDocument((e) => onDidChangeTextDocument(globalhelixState, e)),
    vscode.commands.registerCommand('extension.helixKeymap.escapeKey', () => escapeHandler(globalhelixState)),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownHalfPage', scrollCommands.scrollDownHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpHalfPage', scrollCommands.scrollUpHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownPage', scrollCommands.scrollDownPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpPage', scrollCommands.scrollUpPage),
  );

  enterNormalMode(globalhelixState);
  addTypeSubscription(globalhelixState, typeHandler);

  if (vscode.window.activeTextEditor) {
    onDidChangeActiveTextEditor(globalhelixState, vscode.window.activeTextEditor);
  }
}

export function deactivate(): void {
  removeTypeSubscription(globalhelixState);
}
