import { commands, window } from 'vscode';
import { Action } from '../action_types';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

// https://docs.helix-editor.com/keymap.html#goto-mode
export const gotoActions: Action[] = [
  // G actions
  parseKeysExact(['g', '.'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.navigateToLastEditLocation');
  }),

  parseKeysExact(['g', 'e'], [Mode.Normal], () => {
    commands.executeCommand('cursorBottom');
  }),

  parseKeysExact(['g', 'g'], [Mode.Normal], () => {
    commands.executeCommand('cursorTop');
  }),

  parseKeysExact(['g', 'h'], [Mode.Normal], () => {
    commands.executeCommand('cursorLineStart');
  }),

  parseKeysExact(['g', 'l'], [Mode.Normal], () => {
    commands.executeCommand('cursorLineEnd');
  }),

  parseKeysExact(['g', 's'], [Mode.Normal], () => {
    commands.executeCommand('cursorHome');
  }),

  parseKeysExact(['g', 'd'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.revealDefinition');
  }),

  parseKeysExact(['g', 'y'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.goToTypeDefinition');
  }),

  parseKeysExact(['g', 'r'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.goToReferences');
  }),

  parseKeysExact(['g', 't'], [Mode.Normal], () => {
    commands.executeCommand('cursorPageUp');
  }),

  parseKeysExact(['g', 'b'], [Mode.Normal], () => {
    commands.executeCommand('cursorPageDown');
  }),

  parseKeysExact(['g', 'c'], [Mode.Normal], () => {
    commands.executeCommand('cursorMove', {
      to: 'viewPortCenter',
    });
  }),

  parseKeysExact(['g', 'k'], [Mode.Normal], () => {
    commands.executeCommand('scrollLineUp');
  }),

  parseKeysExact(['g', 'j'], [Mode.Normal], () => {
    commands.executeCommand('scrollLineDown');
  }),

  parseKeysExact(['g', 'a'], [Mode.Normal], (helixState) => {
    // VS Code has no concept of "last accessed file" so instead we'll need to keep track of previous text editors
    const editor = helixState.editorState.previousEditor;
    if (!editor) return;

    window.showTextDocument(editor.document);
  }),

  parseKeysExact(['g', 'm'], [Mode.Normal], (helixState) => {
    // VS Code has no concept of "last accessed file" so instead we'll need to keep track of previous text editors
    const document = helixState.editorState.lastModifiedDocument;
    if (!document) return;

    window.showTextDocument(document);
  }),

  parseKeysExact(['g', 'n'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.nextEditor');
  }),

  parseKeysExact(['g', 'p'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.previousEditor');
  }),
];
