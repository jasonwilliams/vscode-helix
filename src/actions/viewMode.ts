import { commands } from 'vscode';
import { Action } from '../action_types';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';
import KeyMap from './keymaps';

// https://docs.helix-editor.com/keymap.html#view-mode
export const viewActions: Action[] = [
  // align view center
  parseKeysExact(['z', 'c'], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),

  // align view top
  parseKeysExact(['z', 't'], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  // align view bottom
  parseKeysExact(['z', 'b'], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'bottom',
    });
  }),

  parseKeysExact(['z', 'j'], [Mode.Normal], () => {
    commands.executeCommand('scrollLineDown');
  }),

  parseKeysExact(['z', 'k'], [Mode.Normal], () => {
    commands.executeCommand('scrollLineUp');
  }),

  parseKeysExact(['z', KeyMap.Motions.MoveUp], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  parseKeysExact(['z', 'z'], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),

  parseKeysExact(['z', KeyMap.Motions.MoveDown], [Mode.Normal], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'bottom',
    });
  }),
];
