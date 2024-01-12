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
