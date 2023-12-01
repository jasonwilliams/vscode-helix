import { commands } from 'vscode';
import { Action } from '../action_types';
import { enterNormalMode } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact } from '../parse_keys';

// https://docs.helix-editor.com/keymap.html#window-mode
export const windowActions: Action[] = [
  // Crtl+w actions
  parseKeysExact(['w'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.navigateEditorGroups');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['v'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.splitEditor');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['s'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.splitEditorDown');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['F'], [Mode.Window], (helixState) => {
    commands.executeCommand('editor.action.revealDefinitionAside');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['f'], [Mode.Window], (helixState) => {
    commands.executeCommand('editor.action.revealDefinitionAside');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['h'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.focusLeftGroup');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['l'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.focusRightGroup');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['j'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.focusBelowGroup');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['k'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.focusAboveGroup');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['q'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.closeActiveEditor');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['o'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.closeEditorsInOtherGroups');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['H'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.moveActiveEditorGroupLeft');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['L'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.moveActiveEditorGroupRight');
    enterNormalMode(helixState);
  }),

  parseKeysExact(['o'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.closeEditorsInOtherGroups');
    enterNormalMode(helixState);
  }),
  parseKeysExact(['o'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.moveActiveEditorGroupDown');
    enterNormalMode(helixState);
  }),
  parseKeysExact(['o'], [Mode.Window], (helixState) => {
    commands.executeCommand('workbench.action.moveActiveEditorGroupUp');
    enterNormalMode(helixState);
  }),
];
