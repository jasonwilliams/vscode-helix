import { commands } from 'vscode';
import { Action } from '../action_types';
import { enterViewMode } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

// https://docs.helix-editor.com/keymap.html#view-mode
export const viewActions: Action[] = [
  parseKeysExact(['Z'], [Mode.Normal, Mode.Visual], (helixState) => {
    enterViewMode(helixState);
  }),

  // align view center
  parseKeysExact(['z', 'c'], [Mode.Normal, Mode.Visual], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),

  parseKeysExact(['c'], [Mode.View], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),

  // align view top
  parseKeysExact(['z', 't'], [Mode.Normal, Mode.Visual], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  parseKeysExact(['t'], [Mode.View], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  // align view bottom
  parseKeysExact(['z', 'b'], [Mode.Normal, Mode.Visual], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'bottom',
    });
  }),

  parseKeysExact(['b'], [Mode.View], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'bottom',
    });
  }),

  parseKeysExact(['z', 't'], [Mode.Normal, Mode.Visual], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  parseKeysExact(['t'], [Mode.View], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'top',
    });
  }),

  parseKeysExact(['z', 'j'], [Mode.Normal, Mode.Visual], () => {
    commands.executeCommand('scrollLineDown');
  }),

  parseKeysExact(['j'], [Mode.View], () => {
    commands.executeCommand('scrollLineDown');
  }),

  parseKeysExact(['z', 'k'], [Mode.Normal, Mode.Visual], () => {
    commands.executeCommand('scrollLineUp');
  }),

  parseKeysExact(['k'], [Mode.View], () => {
    commands.executeCommand('scrollLineUp');
  }),

  parseKeysExact(['z', 'z'], [Mode.Normal, Mode.Visual], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),

  parseKeysExact(['z'], [Mode.View], (_, editor) => {
    commands.executeCommand('revealLine', {
      lineNumber: editor.selection.active.line,
      at: 'center',
    });
  }),
];
