import { HelixState } from './helix_state_types';

// class which handles the search functionality
export class SearchState {
  searchString = '';

  /** Add character to search string */
  addChar(helixState: HelixState, char: string): void {
    this.searchString += char;
    helixState.commandLine.setText(this.searchString, helixState);
  }
}

export const searchState = new SearchState();
