import type { Disposable, TextDocument } from 'vscode';
import { Range, TextEditor } from 'vscode';
import type { SymbolProvider } from './SymbolProvider';
import { CommandLine } from './commandLine';
import type { Mode } from './modes_types';
import { SearchState } from './search';

/** This represents the global Helix state used across the board */
export type HelixState = {
  typeSubscription: Disposable | undefined;
  mode: Mode;
  keysPressed: string[];
  numbersPressed: string[];
  resolveCount: () => number;
  registers: {
    contentsList: (string | undefined)[];
    linewise: boolean;
  };
  symbolProvider: SymbolProvider;
  editorState: {
    activeEditor: TextEditor | undefined;
    previousEditor: TextEditor | undefined;
    lastModifiedDocument: TextDocument | undefined;
  };
  commandLine: CommandLine;
  searchState: SearchState;
  /**
   * The current range we're searching in when calling select
   * This is better kept on the global state as it's used for multiple things
   */
  currentSelection: Range | null;
  repeatLastMotion: (vimState: HelixState, editor: TextEditor) => void;
  lastPutRanges: {
    ranges: (Range | undefined)[];
    linewise: boolean;
  };
};
