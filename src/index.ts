import * as vscode from 'vscode';

import { commandLine } from './commandLine';
import { escapeHandler } from './escape_handler';
import { onDidChangeActiveTextEditor, onDidChangeTextDocument } from './eventHandlers';
import { HelixState } from './helix_state_types';
import { enterDisabledMode, enterNormalMode, enterSearchMode, enterWindowMode, setModeCursorStyle } from './modes';
import { Mode } from './modes_types';
import * as scrollCommands from './scroll_commands';
import { searchState } from './search';
import { symbolProvider } from './SymbolProvider';
import { typeHandler } from './type_handler';
import { addTypeSubscription, removeTypeSubscription } from './type_subscription';

const globalhelixState: HelixState = {
  typeSubscription: undefined,
  mode: Mode.Insert,
  keysPressed: [],
  numbersPressed: [],
  resolveCount: function () {
    // We can resolve this lazily as not every function will need it
    // So we don't want it running on every keystroke or every command
    return parseInt(this.numbersPressed.join(''), 10) || 1;
  },
  registers: {
    contentsList: [],
    linewise: true,
  },
  symbolProvider,
  editorState: {
    activeEditor: undefined,
    previousEditor: undefined,
    lastModifiedDocument: undefined,
  },
  commandLine,
  searchState,
  currentSelection: null,
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
    // vscode.window.onDidChangeTextEditorSelection((e) => onSelectionChange(globalhelixState, e)),
    vscode.window.onDidChangeActiveTextEditor((editor) => onDidChangeActiveTextEditor(globalhelixState, editor)),
    vscode.workspace.onDidChangeTextDocument((e) => onDidChangeTextDocument(globalhelixState, e)),
    vscode.commands.registerCommand('extension.helixKeymap.escapeKey', () => escapeHandler(globalhelixState)),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownHalfPage', scrollCommands.scrollDownHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpHalfPage', scrollCommands.scrollUpHalfPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollDownPage', scrollCommands.scrollDownPage),
    vscode.commands.registerCommand('extension.helixKeymap.scrollUpPage', scrollCommands.scrollUpPage),
    vscode.commands.registerCommand('extension.helixKeymap.enterSearchMode', () => enterSearchMode(globalhelixState)),
    vscode.commands.registerCommand('extension.helixKeymap.exitSearchMode', () =>
      globalhelixState.searchState.enter(globalhelixState),
    ),
    vscode.commands.registerCommand('extension.helixKeymap.enterWindowMode', () => enterWindowMode(globalhelixState)),
    vscode.commands.registerCommand('extension.helixKeymap.backspaceSearchMode', () => {
      globalhelixState.searchState.backspace(globalhelixState);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.nextSearchResult', () =>
      globalhelixState.searchState.nextSearchResult(globalhelixState),
    ),
    vscode.commands.registerCommand('extension.helixKeymap.previousSearchResult', () =>
      globalhelixState.searchState.previousSearchResult(globalhelixState),
    ),
    vscode.commands.registerCommand('extension.helixKeymap.enterDisabledMode', () => {
      enterDisabledMode(globalhelixState);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.enableHelix', () => {
      enterNormalMode(globalhelixState);
      setModeCursorStyle(globalhelixState.mode, vscode.window.activeTextEditor!);
      addTypeSubscription(globalhelixState, typeHandler);
    }),
  );

  enterNormalMode(globalhelixState);
  addTypeSubscription(globalhelixState, typeHandler);

  if (vscode.window.activeTextEditor) {
    setModeCursorStyle(globalhelixState.mode, vscode.window.activeTextEditor);
    onDidChangeActiveTextEditor(globalhelixState, vscode.window.activeTextEditor);
  }
}

export function deactivate(): void {
  removeTypeSubscription(globalhelixState);
}
