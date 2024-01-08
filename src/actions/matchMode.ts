import * as vscode from 'vscode';
import { Action } from '../action_types';
import { enterInsertMode, setModeCursorStyle } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';
import { removeTypeSubscription } from '../type_subscription';
import { delete_ } from './operators';

export const matchActions: Action[] = [
  // Implemenent jump to bracket
  parseKeysExact(['m', 'm'], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  }),

  // Delete match
  parseKeysExact(['d'], [Mode.Normal, Mode.Visual], (_, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    delete_(editor, ranges, false);
  }),

  // edit match
  parseKeysExact(['c'], [Mode.Normal, Mode.Visual], (helixState, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    delete_(editor, ranges, false);
    enterInsertMode(helixState);
    setModeCursorStyle(helixState.mode, editor);
    removeTypeSubscription(helixState);
  }),
];
