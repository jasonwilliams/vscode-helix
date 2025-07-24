import * as vscode from 'vscode';

import { Action } from '../action_types';
import { HelixState } from '../helix_state_types';
import { enterNormalMode, setModeCursorStyle, setRelativeLineNumbers } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysOperator } from '../parse_keys';
import { operatorRanges } from './operator_ranges';

export const operators: Action[] = [
  parseKeysOperator(['d'], operatorRanges, (vimState, editor, ranges, linewise) => {
    if (ranges.every((x) => x === undefined)) return;

    cursorsToRangesStart(editor, ranges);

    delete_(editor, ranges, linewise);

    if (vimState.mode === Mode.Visual || vimState.mode === Mode.VisualLine) {
      enterNormalMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      setRelativeLineNumbers(vimState.mode, editor);
    }
  }),

  // Match Mode
  parseKeysOperator(['m'], operatorRanges, (vimState, editor, ranges) => {
    if (ranges.every((x) => x === undefined)) {
      return;
    }

    editor.selections = ranges.map((range, i) => {
      if (range) {
        const start = range.start;
        const end = range.end;
        return new vscode.Selection(start, end);
      } else {
        return editor.selections[i];
      }
    });
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  }),

  parseKeysOperator(['q'], operatorRanges, (vimState, editor, ranges, _linewise) => {
    if (ranges.every((x) => x === undefined) || vimState.mode === Mode.Visual || vimState.mode === Mode.VisualLine) {
      return;
    }

    editor.selections = ranges.map((range, i) => {
      if (range) {
        const start = range.start;
        const end = range.end;
        return new vscode.Selection(start, end);
      } else {
        return editor.selections[i];
      }
    });

    vscode.commands.executeCommand('editor.action.copyLinesDownAction');
  }),
];

function cursorsToRangesStart(editor: vscode.TextEditor, ranges: readonly (vscode.Range | undefined)[]) {
  editor.selections = editor.selections.map((selection, i) => {
    const range = ranges[i];

    if (range) {
      const newPosition = range.start;
      return new vscode.Selection(newPosition, newPosition);
    } else {
      return selection;
    }
  });
}

export function delete_(editor: vscode.TextEditor, ranges: readonly (vscode.Range | undefined)[], linewise: boolean) {
  if (ranges.length === 1 && ranges[0] && isEmptyRange(ranges[0])) {
    vscode.commands.executeCommand('deleteRight');
    return;
  }

  editor
    .edit((editBuilder) => {
      ranges.forEach((range) => {
        if (!range) return;

        let deleteRange = range;

        if (linewise) {
          const start = range.start;
          const end = range.end;

          if (end.line === editor.document.lineCount - 1) {
            if (start.line === 0) {
              deleteRange = new vscode.Range(start.with({ character: 0 }), end);
            } else {
              deleteRange = new vscode.Range(
                new vscode.Position(start.line - 1, editor.document.lineAt(start.line - 1).text.length),
                end,
              );
            }
          } else {
            deleteRange = new vscode.Range(range.start, new vscode.Position(end.line + 1, 0));
          }
        }

        editBuilder.delete(deleteRange);
      });
    })
    .then(() => {
      // For linewise deletions, make sure cursor is at beginning of line
      editor.selections = editor.selections.map((selection, i) => {
        const range = ranges[i];

        if (range && linewise) {
          const newPosition = selection.start.with({ character: 0 });
          return new vscode.Selection(newPosition, newPosition);
        } else {
          return selection;
        }
      });
    });
}

export function yank(
  vimState: HelixState,
  editor: vscode.TextEditor,
  ranges: (vscode.Range | undefined)[],
  linewise: boolean,
) {
  vimState.registers = {
    contentsList: ranges.map((range, i) => {
      if (range) {
        return editor.document.getText(range);
      } else {
        return vimState.registers.contentsList[i];
      }
    }),
    linewise: linewise,
  };
}

// detect if a range is covering just a single character
function isEmptyRange(range: vscode.Range) {
  return range.start.line === range.end.line && range.start.character === range.end.character;
}

// detect if the range spans a whole line and only one line
// Theres a weird issue where the cursor jumps to the next line when doing expand line selection
// https://github.com/microsoft/vscode/issues/118015#issuecomment-854964022
export function isSingleLineRange(range: vscode.Range): boolean {
  return range.start.line === range.end.line && range.start.character === 0 && range.end.character === 0;
}
