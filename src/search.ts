import * as vscode from 'vscode';
import { HelixState } from './helix_state_types';
import { enterNormalMode } from './modes';

// class which handles the search functionality
export class SearchState {
  /** Current search string */
  searchString = '';
  /** List of previous search strings */
  searchHistory: string[] = [];
  /** Index of the current search string in the search history */
  searchHistoryIndex: number = this.searchHistory.length - 1; // Add this line

  clearSearchString(helixState: HelixState): void {
    this.searchString = '';
    helixState.commandLine.setText(this.searchString, helixState);
  }

  /** Add character to search string */
  addChar(helixState: HelixState, char: string): void {
    this.searchString += char;
    helixState.commandLine.setText(this.searchString, helixState);
    this.findInstancesInDocument(helixState, this.searchString);
  }

  /** The "type" event handler doesn't pick up backspace so it needs to be dealt with separately */
  backspace(helixState: HelixState): void {
    this.searchString = this.searchString.slice(0, -1);
    helixState.commandLine.setText(this.searchString, helixState);
  }

  /** Clear search string and return to Normal mode */
  enter(helixState: HelixState): void {
    this.searchHistory.push(this.searchString);
    this.searchString = '';
    helixState.commandLine.setText(this.searchString, helixState);
    // Add the current selection to the next find match
    vscode.commands.executeCommand('editor.action.addSelectionToNextFindMatch');
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
