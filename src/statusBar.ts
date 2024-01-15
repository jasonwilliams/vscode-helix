import * as vscode from 'vscode';
import { HelixState } from './helix_state_types';
import { Mode } from './modes_types';

class StatusBarImpl implements vscode.Disposable {
  // Displays the current state (mode, recording macro, etc.) and messages to the user
  private readonly statusBarItem: vscode.StatusBarItem;

  private previousMode: Mode | undefined = undefined;
  private showingDefaultMessage = true;
  private themeBackgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');

  public lastMessageTime: Date | undefined;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      'primary',
      vscode.StatusBarAlignment.Left,
      Number.MIN_SAFE_INTEGER, // Furthest right on the left
    );
    this.statusBarItem.name = 'Helix Command Line';
    this.statusBarItem.text = 'NOR';
    this.statusBarItem.show();
  }

  dispose() {
    this.statusBarItem.dispose();
  }

  /**
   * Updates the status bar text
   * @param isError If true, text rendered in red
   */
  public setText(helixState: HelixState, text: string) {
    // Text
    text = text.replace(/\n/g, '^M');
    if (this.statusBarItem.text !== text) {
      this.statusBarItem.text = `${this.statusBarPrefix(helixState)} ${text}`;
    }

    this.previousMode = helixState.mode;
    this.showingDefaultMessage = false;
    this.lastMessageTime = new Date();
  }

  public displayError(vimState: HelixState, error: string | Error) {
    StatusBar.setText(vimState, error.toString());
  }

  public getText() {
    return this.statusBarItem.text.replace(/\^M/g, '\n');
  }

  /**
   * Clears any messages from the status bar, leaving the default info, such as
   * the current mode and macro being recorded.
   * @param force If true, will clear even high priority messages like errors.
   */
  public clear(helixState: HelixState, force = true) {
    if (!this.showingDefaultMessage && !force) {
      return;
    }

    StatusBar.setText(helixState, '');
    this.showingDefaultMessage = true;
  }

  statusBarPrefix(helixState: HelixState) {
    switch (helixState.mode) {
      case Mode.Normal:
        this.statusBarItem.backgroundColor = undefined;
        return 'NOR';
      case Mode.Visual:
        return 'NOR (V)';
      case Mode.Insert:
        return 'INS';
      case Mode.Disabled:
        return '-- HELIX DISABLED --';
      case Mode.SearchInProgress:
        this.statusBarItem.backgroundColor = this.themeBackgroundColor;
        return 'SER:';
      case Mode.Select:
        this.statusBarItem.backgroundColor = this.themeBackgroundColor;
        return 'SEL:';
      case Mode.Window:
        return 'WIN';
      case Mode.CommandlineInProgress:
        return ':';
      case Mode.View:
        return 'VIEW';
      default:
        return '';
    }
  }
}

export const StatusBar = new StatusBarImpl();
