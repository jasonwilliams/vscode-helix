import * as vscode from 'vscode';
import { HelixState } from './helix_state_types';
import { Mode } from './modes_types';
// Create a class which has access to the VSCode status bar

class StatusBar {
  private readonly statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.statusBarItem.text = 'Helix';
    this.statusBarItem.show();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }

  public setText(text: string, helixState: HelixState): void {
    const modeStatus = helixState.mode === Mode.Normal ? 'NOR' : 'INS';
    this.statusBarItem.text = `text`;
  }
}
