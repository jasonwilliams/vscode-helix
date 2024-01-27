import { Selection, TextEditorRevealType, commands } from 'vscode';
import { Action } from '../action_types';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

export const unimparedActions: Action[] = [
  parseKeysExact([']', 'D'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.marker.next');
  }),

  parseKeysExact(['[', 'D'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.marker.prev');
  }),

  parseKeysExact([']', 'd'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.marker.nextInFiles');
  }),

  parseKeysExact(['[', 'd'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.marker.prevInFiles');
  }),

  parseKeysExact(['[', 'g'], [Mode.Normal], () => {
    // There is no way to check if we're in compare editor mode or not so i need to call both commands
    commands.executeCommand('workbench.action.compareEditor.previousChange');
    commands.executeCommand('workbench.action.editor.previousChange');
  }),

  parseKeysExact([']', 'g'], [Mode.Normal], () => {
    // There is no way to check if we're in compare editor mode or not so i need to call both commands
    commands.executeCommand('workbench.action.compareEditor.nextChange');
    commands.executeCommand('workbench.action.editor.nextChange');
  }),

  parseKeysExact([']', 'f'], [Mode.Normal], (helixState, editor) => {
    const range = helixState.symbolProvider.getNextFunctionRange(editor);
    if (range) {
      editor.revealRange(range, TextEditorRevealType.InCenter);
      editor.selection = new Selection(range.start, range.end);
    }
  }),

  parseKeysExact(['[', 'f'], [Mode.Normal], (helixState, editor) => {
    const range = helixState.symbolProvider.getPreviousFunctionRange(editor);
    if (range) {
      editor.revealRange(range, TextEditorRevealType.InCenter);
      editor.selection = new Selection(range.start, range.end);
    }
  }),
];
