import * as vscode from 'vscode';

import { symbolProvider } from './SymbolProvider';
import { decrement, incremenet, switchToUppercase } from './actions/actions';
import { commandLine } from './commandLine';
import { escapeHandler } from './escape_handler';
import { onDidChangeActiveTextEditor, onDidChangeTextDocument } from './eventHandlers';
import { HelixState } from './helix_state_types';
import {
  enterDisabledMode,
  enterNormalMode,
  enterSearchMode,
  enterWindowMode,
  setModeCursorStyle,
  setRelativeLineNumbers,
} from './modes';
import { Mode } from './modes_types';
import * as scrollCommands from './scroll_commands';
import { searchState } from './search';
import { flipSelection } from './selection_utils';
import { typeHandler } from './type_handler';
import { addTypeSubscription, removeTypeSubscription } from './type_subscription';

const globalhelixState: HelixState = {
  typeSubscription: undefined,
  mode: Mode.Normal,
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
  repeatLastMotion: () => undefined,
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
    vscode.commands.registerCommand('extension.helixKeymap.backspaceCommandMode', () => {
      globalhelixState.commandLine.backspace(globalhelixState);
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
      setRelativeLineNumbers(globalhelixState.mode, vscode.window.activeTextEditor!);
      addTypeSubscription(globalhelixState, typeHandler);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.flipSelection', () => {
      flipSelection(vscode.window.activeTextEditor);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.clipboardPasteAction', () => {
      vscode.env.clipboard.readText().then((text) => {
        globalhelixState.searchState.addText(globalhelixState, text);
      });
    }),
    vscode.commands.registerCommand('extension.helixKeymap.repeatLastMotion', () => {
      globalhelixState.repeatLastMotion(globalhelixState, vscode.window.activeTextEditor!);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.switchToUppercase', () => {
      switchToUppercase(vscode.window.activeTextEditor!);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.increment', () => {
      incremenet(vscode.window.activeTextEditor!);
    }),
    vscode.commands.registerCommand('extension.helixKeymap.decrement', () => {
      decrement(vscode.window.activeTextEditor!);
    }),
  );

  enterNormalMode(globalhelixState);
  addTypeSubscription(globalhelixState, typeHandler);

  if (vscode.window.activeTextEditor) {
    setModeCursorStyle(globalhelixState.mode, vscode.window.activeTextEditor);
    setRelativeLineNumbers(globalhelixState.mode, vscode.window.activeTextEditor);
    onDidChangeActiveTextEditor(globalhelixState, vscode.window.activeTextEditor);
  }
}

export function deactivate(): void {
  removeTypeSubscription(globalhelixState);
}
