import { commands } from 'vscode';
import { Action } from '../action_types';
import { enterWindowMode } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

// https://docs.helix-editor.com/keymap.html#space-mode
export const spaceActions: Action[] = [
  // Open File Picker
  parseKeysExact([' ', 'f'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.quickOpen');
  }),

  parseKeysExact([' ', 'g'], [Mode.Normal], () => {
    commands.executeCommand('workbench.debug.action.focusBreakpointsView');
  }),

  parseKeysExact([' ', 'k'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.showHover');
  }),

  parseKeysExact([' ', 's'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.gotoSymbol');
  }),

  parseKeysExact([' ', 'S'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.showAllSymbols');
  }),

  // View problems in current file
  parseKeysExact([' ', 'd'], [Mode.Normal], () => {
    commands.executeCommand('workbench.actions.view.problems');
    // It's not possible to set active file on and off, you can only toggle it, which makes implementing this difficult
    // For now both d and D will do the same thing and search all of the workspace

    // Leaving this here for future reference
    // commands.executeCommand('workbench.actions.workbench.panel.markers.view.toggleActiveFile');
  }),

  // View problems in workspace
  parseKeysExact([' ', 'D'], [Mode.Normal], () => {
    // alias of 'd'. See above
    commands.executeCommand('workbench.actions.view.problems');
  }),

  parseKeysExact([' ', 'r'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.rename');
  }),

  parseKeysExact([' ', 'a'], [Mode.Normal], () => {
    commands.executeCommand('editor.action.quickFix');
  }),

  parseKeysExact([' ', 'w'], [Mode.Normal], (helixState) => {
    enterWindowMode(helixState);
  }),

  parseKeysExact([' ', '/'], [Mode.Normal], () => {
    commands.executeCommand('workbench.action.findInFiles');
  }),
];
