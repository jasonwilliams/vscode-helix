import * as vscode from 'vscode';
import { Action } from '../action_types';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

export const matchActions: Action[] = [
  // Implemenent jump to bracket
  parseKeysExact(['m', 'm'], [Mode.Normal], () => {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  }),
];
