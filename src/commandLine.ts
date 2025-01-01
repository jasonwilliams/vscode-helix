import * as vscode from 'vscode';
import { HelixState } from './helix_state_types';
import { StatusBar } from './statusBar';
import { enterNormalMode } from './modes';
// Create a class which has access to the VSCode status bar

export class CommandLine {

  // Buffer to save text written in the command-line
  commandLineText = '';

  // concatenate each keystroke to a buffer
  addChar(helixState: HelixState, char: string): void{
    if (char==='\n'){
      // when the `enter` key is pressed
      this.enter(helixState)
      return;
    }
    this.commandLineText += char;
    // display what the user has written in command mode
    this.setText(this.commandLineText, helixState);
  }
  public clearCommandString(helixState: HelixState): void {
    this.commandLineText = '';
    this.setText(this.commandLineText, helixState);
  }
  public setText(text: string, helixState: HelixState): void {
    StatusBar.setText(helixState, text);
  }
  enter(helixState: HelixState): void{
      if (this.commandLineText === "w") {
        vscode.window.activeTextEditor?.document.save();
      } else if (this.commandLineText === "wa"){
        vscode.workspace.saveAll(true);
      }
      this.commandLineText = '';
      this.setText(this.commandLineText, helixState);
      enterNormalMode(helixState);
  }
  
  backspace(helixState: HelixState): void {
    this.commandLineText = this.commandLineText.slice(0, -1) 
    this.setText(this.commandLineText, helixState);
  }

}

export const commandLine = new CommandLine();
