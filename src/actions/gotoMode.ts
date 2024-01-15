import { Selection, commands, window } from 'vscode';
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

  parseKeysExact(['g', 'e'], [Mode.Visual], () => {
    commands.executeCommand('cursorBottomSelect');
  }),

  parseKeysExact(['g', 'g'], [Mode.Normal], (helixState, editor) => {
    const count = helixState.resolveCount();
    if (count !== 1) {
      const range = editor.document.lineAt(count - 1).range;
      editor.selection = new Selection(range.start, range.end);
      editor.revealRange(range);
      return;
    }

    commands.executeCommand('cursorTop');
  }),

  parseKeysExact(['g', 'g'], [Mode.Visual], (helixState, editor) => {
    const count = helixState.resolveCount();
    if (count !== 1) {
      const position = editor.selection.active;
      const range = editor.document.lineAt(count - 1).range;
      if (position.isBefore(range.start)) {
        editor.selection = new Selection(position, range.end);
      } else {
        editor.selection = new Selection(position, range.start);
      }
      return;
    }

    commands.executeCommand('cursorTopSelect');
  }),

  parseKeysExact(['g', 'h'], [Mode.Normal], () => {
    commands.executeCommand('cursorLineStart');
  }),

  parseKeysExact(['g', 'h'], [Mode.Visual], () => {
    commands.executeCommand('cursorLineStartSelect');
  }),

  parseKeysExact(['g', 'l'], [Mode.Normal], () => {
    commands.executeCommand('cursorLineEnd');
  }),

  parseKeysExact(['g', 'l'], [Mode.Visual], () => {
    commands.executeCommand('cursorLineEndSelect');
  }),

  parseKeysExact(['g', 's'], [Mode.Normal], () => {
    commands.executeCommand('cursorHome');
  }),

  parseKeysExact(['g', 's'], [Mode.Visual], () => {
    commands.executeCommand('cursorHomeSelect');
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

  parseKeysExact(['g', 't'], [Mode.Visual], () => {
    commands.executeCommand('cursorPageUpSelect');
  }),

  parseKeysExact(['g', 'b'], [Mode.Normal], () => {
    commands.executeCommand('cursorPageDown');
  }),

  parseKeysExact(['g', 'b'], [Mode.Visual], () => {
    commands.executeCommand('cursorPageDownSelect');
  }),

  parseKeysExact(['g', 'c'], [Mode.Normal], () => {
    commands.executeCommand('cursorMove', {
      to: 'viewPortCenter',
    });
  }),

  parseKeysExact(['g', 'c'], [Mode.Visual], () => {
    commands.executeCommand('cursorMove', {
      to: 'viewPortCenter',
      select: true,
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
