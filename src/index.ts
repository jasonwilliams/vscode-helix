import * as vscode from 'vscode';

import { escapeHandler } from './escape_handler';
import { onDidChangeActiveTextEditor, onDidChangeTextDocument, onSelectionChange } from './eventHandlers';
import { HelixState } from './helix_state_types';
import { enterNormalMode, enterWindowMode } from './modes';
import { Mode } from './modes_types';
import * as scrollCommands from './scroll_commands';
import { typeHandler } from './type_handler';
import { addTypeSubscription, removeTypeSubscription } from './type_subscription';

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

/** This is the main entry point into the Helix VSCode extension */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => onSelectionChange(globalhelixState, e)),
    vscode.window.onDidChangeActiveTextEditor((editor) => onDidChangeActiveTextEditor(globalhelixState, editor)),
    vscode.workspace.onDidChangeTextDocument((e) => onDidChangeTextDocument(globalhelixState, e)),
    vscode.commands.registerCommand('extension.helixKeymap.escapeKey', () => escapeHandler(globalhelixState)),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownHalfPage', scrollCommands.scrollDownHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpHalfPage', scrollCommands.scrollUpHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownPage', scrollCommands.scrollDownPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpPage', scrollCommands.scrollUpPage),
    vscode.commands.registerCommand('extension.helixKeymap.enterWindowMode', () => {
      enterWindowMode(globalhelixState);
    }),
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
