import * as vscode from 'vscode';
import { HelixState } from './helix_state_types';
import { enterNormalMode } from './modes';
import { Mode } from './modes_types';

// class which handles the search & select functionality
export class SearchState {
  /** Current search string */
  searchString = '';
  /** List of previous search strings */
  searchHistory: string[] = [];
  /** Index of the current search string in the search history */
  searchHistoryIndex: number = this.searchHistory.length - 1; // Add this line
  /** Have we just come out of select mode? */
  selectModeActive: boolean = false;

  clearSearchString(helixState: HelixState): void {
    this.searchString = '';
    helixState.commandLine.setText(this.searchString, helixState);
  }

  /** Add character to search string */
  addChar(helixState: HelixState, char: string): void {
    if (char === '\n') {
      this.enter(helixState);
      return;
    }
    this.searchString += char;
    helixState.commandLine.setText(this.searchString, helixState);
    if (helixState.mode === Mode.Select) {
      this.findInstancesInRange(helixState, this.searchString);
    } else {
      this.findInstancesInDocument(helixState, this.searchString);
    }
  }

  /** The "type" event handler doesn't pick up backspace so it needs to be dealt with separately */
  backspace(helixState: HelixState): void {
    this.searchString = this.searchString.slice(0, -1);
    helixState.commandLine.setText(this.searchString, helixState);
    if (this.searchString && helixState.mode === Mode.Select) {
      this.findInstancesInRange(helixState, this.searchString);
    } else if (this.searchString) {
      this.findInstancesInDocument(helixState, this.searchString);
    }
  }

  /** Clear search string and return to Normal mode */
  enter(helixState: HelixState): void {
    this.searchHistory.push(this.searchString);
    this.searchString = '';
    helixState.commandLine.setText(this.searchString, helixState);

    // Upstream Bug
    // Annoyingly, addSelectionToNextFindMatch actually does 2 things.
    // For normal search it will put the selection into the search buffer (which is fine)
    // But for selection (ctrl+d), it will select the next matching selection (which we don't want)
    // We will need to compare the selections, and if they've changed remove the last one
    // Cache what we have before calling the commmand

    // Add the current selection to the next find match
    if (helixState.mode === Mode.SearchInProgress) {
      vscode.commands.executeCommand('editor.action.addSelectionToNextFindMatch');
    }

    if (helixState.mode === Mode.Select) {
      // Set a flag to signal we're in select mode, so when we go to search we can search the current selection
      // This is a mitigation around https://github.com/jasonwilliams/vscode-helix/issues/5
      this.selectModeActive = true;
    }
    // reset search history index
    this.searchHistoryIndex = this.searchHistory.length - 1;
    enterNormalMode(helixState);
  }

  findInstancesInDocument(helixState: HelixState, searchString: string): void {
    const editor = helixState.editorState.activeEditor;
    if (editor) {
      const document = editor.document;
      const foundRanges: vscode.Range[] = [];
      const searchRegex = new RegExp(searchString, 'g');
      const match = searchRegex.exec(document.getText());
      if (match) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        foundRanges.push(new vscode.Range(startPos, endPos));
      }
      editor.selections = foundRanges.map((range) => new vscode.Selection(range.start, range.end));
    }
  }

  findInstancesInRange(helixState: HelixState, searchString: string): void {
    const editor = helixState.editorState.activeEditor;
    if (editor) {
      const document = editor.document;
      const foundRanges: vscode.Range[] = [];
      const searchRegex = new RegExp(searchString, 'g');
      let match;
      while ((match = searchRegex.exec(document.getText()))) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const foundRange = new vscode.Range(startPos, endPos);
        if (helixState.currentSelection?.contains(foundRange)) {
          foundRanges.push(foundRange);
        }
      }
      editor.selections = foundRanges.map((range) => new vscode.Selection(range.start, range.end));
    }
  }

  /** Go to the previous search result in our search history */
  previousSearchResult(helixState: HelixState): void {
    if (this.searchHistory.length > 0) {
      this.searchString = this.searchHistory[this.searchHistoryIndex] || '';
      this.searchHistoryIndex = Math.max(this.searchHistoryIndex - 1, 0); // Add this line
      helixState.commandLine.setText(this.searchString, helixState);
      this.findInstancesInDocument(helixState, this.searchString);
    }
  }

  nextSearchResult(helixState: HelixState): void {
    if (this.searchHistory.length > 0) {
      this.searchString = this.searchHistory[this.searchHistoryIndex] || '';
      this.searchHistoryIndex = Math.min(this.searchHistoryIndex + 1, this.searchHistory.length - 1); // Add this line
      helixState.commandLine.setText(this.searchString, helixState);
      this.findInstancesInDocument(helixState, this.searchString);
    }
  }
}

export const searchState = new SearchState();
