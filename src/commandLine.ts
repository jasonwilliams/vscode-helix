import { HelixState } from './helix_state_types';
import { StatusBar } from './statusBar';
// Create a class which has access to the VSCode status bar

export class CommandLine {
  public setText(text: string, helixState: HelixState): void {
    StatusBar.setText(helixState, text);
  }
}

export const commandLine = new CommandLine();
