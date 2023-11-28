import type { Disposable, TextDocument } from 'vscode';
import { Range, TextEditor } from 'vscode';
import { CommandLine } from './commandLine';
import type { Mode } from './modes_types';
import { SearchState } from './search';

/** This represents the global Helix state used across the board */
export type HelixState = {
  typeSubscription: Disposable | undefined;
  mode: Mode;
  keysPressed: string[];
  registers: {
    contentsList: (string | undefined)[];
    linewise: boolean;
  };
  editorState: {
    activeEditor: TextEditor | undefined;
    previousEditor: TextEditor | undefined;
    lastModifiedDocument: TextDocument | undefined;
  };
  commandLine: CommandLine;
  searchState: SearchState;
  semicolonAction: (vimState: HelixState, editor: TextEditor) => void;
  commaAction: (vimState: HelixState, editor: TextEditor) => void;
  lastPutRanges: {
    ranges: (Range | undefined)[];
    linewise: boolean;
  };
};
