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
  /** Last active position before search */
  lastActivePosition: vscode.Position | undefined;

  // https://github.com/helix-editor/helix/issues/4978
  getFlags(): string {
    if (this.searchString.startsWith('(?i)')) {
      return 'gi';
    } else if (this.searchString.startsWith('(?-i)')) {
      return 'g';
    }

    return this.searchString === this.searchString.toLowerCase() ? 'gi' : 'g';
  }

  getNormalisedSearchString(): string {
    if (this.searchString.startsWith('(?i)')) {
      return this.searchString.slice(4);
    } else if (this.searchString.startsWith('(?-i)')) {
      return this.searchString.slice(5);
    }

    return this.searchString;
  }

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

    // If we've just started a search, set a marker where we were so we can go back on escape
    if (this.searchString === '') {
      this.lastActivePosition = helixState.editorState.activeEditor?.selection.active;
    }

    this.searchString += char;
    helixState.commandLine.setText(this.searchString, helixState);
    if (helixState.mode === Mode.Select) {
      this.findInstancesInRange(helixState);
    } else {
      this.findInstancesInDocument(helixState);
    }
  }

  addText(helixState: HelixState, text: string): void {
    // If we've just started a search, set a marker where we were so we can go back on escape
    if (this.searchString === '') {
      this.lastActivePosition = helixState.editorState.activeEditor?.selection.active;
    }

    this.searchString += text;
    helixState.commandLine.setText(this.searchString, helixState);
    if (helixState.mode === Mode.Select) {
      this.findInstancesInRange(helixState);
    } else {
      this.findInstancesInDocument(helixState);
    }
  }

  /** The "type" event handler doesn't pick up backspace so it needs to be dealt with separately */
  backspace(helixState: HelixState): void {
    this.searchString = this.searchString.slice(0, -1);
    helixState.commandLine.setText(this.searchString, helixState);
    if (this.searchString && helixState.mode === Mode.Select) {
      this.findInstancesInRange(helixState);
    } else if (this.searchString) {
      this.findInstancesInDocument(helixState);
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

  findInstancesInDocument(helixState: HelixState): void {
    const editor = helixState.editorState.activeEditor;
    if (editor) {
      const document = editor.document;
      const flags = this.getFlags();
      const searchRegex = new RegExp(this.getNormalisedSearchString(), flags);
      const match = searchRegex.exec(document.getText());
      let startPos: vscode.Position | undefined;
      let endPos: vscode.Position | undefined;
      if (match) {
        startPos = document.positionAt(match.index);
        endPos = document.positionAt(match.index + match[0].length);
        editor.selection = new vscode.Selection(startPos, endPos);
        // We should also move the viewport to our match if there is one
        editor.revealRange(new vscode.Range(startPos, endPos));
      } else {
        // If we can't find a match view the last saved position
        if (this.lastActivePosition) {
          editor.selection = new vscode.Selection(this.lastActivePosition, this.lastActivePosition);
          editor.revealRange(new vscode.Range(this.lastActivePosition, this.lastActivePosition));
        }
      }
    }
  }

  findInstancesInRange(helixState: HelixState): void {
    const editor = helixState.editorState.activeEditor;
    if (editor) {
      const document = editor.document;
      const foundRanges: vscode.Range[] = [];
      const flags = this.getFlags();
      const searchRegex = new RegExp(this.getNormalisedSearchString(), flags);
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
      this.findInstancesInDocument(helixState);
    }
  }

  nextSearchResult(helixState: HelixState): void {
    if (this.searchHistory.length > 0) {
      this.searchString = this.searchHistory[this.searchHistoryIndex] || '';
      this.searchHistoryIndex = Math.min(this.searchHistoryIndex + 1, this.searchHistory.length - 1); // Add this line
      helixState.commandLine.setText(this.searchString, helixState);
      this.findInstancesInDocument(helixState);
    }
  }
}

export const searchState = new SearchState();
