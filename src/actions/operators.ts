import * as vscode from "vscode";

import { Action } from "../action_types";
import { operatorRanges } from "./operator_ranges";
import { parseKeysOperator } from "../parse_keys";
import {
  enterInsertMode,
  enterNormalMode,
  setModeCursorStyle,
  enterVisualLineMode,
  enterVisualMode
} from "../modes";
import { removeTypeSubscription } from "../type_subscription";
import { VimState } from "../vim_state_types";
import { Mode } from "../modes_types";
import { flashYankHighlight } from "../yank_highlight";

export const operators: Action[] = [
  parseKeysOperator(
    ["d"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every(x => x === undefined)) return;

      cursorsToRangesStart(editor, ranges);

      delete_(editor, ranges, linewise);

      if (vimState.mode === Mode.Visual || vimState.mode === Mode.VisualLine) {
        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      }
    }
  ),
  parseKeysOperator(
    ["c"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every(x => x === undefined)) return;

      cursorsToRangesStart(editor, ranges);

      editor.edit(editBuilder => {
        ranges.forEach(range => {
          if (!range) return;
          editBuilder.delete(range);
        });
      });

      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysOperator(
    ["y"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every(x => x === undefined)) return;

      yank(vimState, editor, ranges, linewise);

      if (vimState.mode === Mode.Visual || vimState.mode === Mode.VisualLine) {
        // Move cursor to start of yanked text
        editor.selections = editor.selections.map(selection => {
          return new vscode.Selection(selection.start, selection.start);
        });

        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      } else {
        // Yank highlight
        const highlightRanges: vscode.Range[] = [];
        ranges.forEach(range => {
          if (range) {
            highlightRanges.push(new vscode.Range(range.start, range.end));
          }
        });
        flashYankHighlight(editor, highlightRanges);
      }
    }
  ),
  parseKeysOperator(
    ["r"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every(x => x === undefined)) return;

      cursorsToRangesStart(editor, ranges);

      yank(vimState, editor, ranges, linewise);
      delete_(editor, ranges, linewise);

      if (vimState.mode === Mode.Visual || vimState.mode === Mode.VisualLine) {
        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      }
    }
  ),
  parseKeysOperator(
    ["s"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (
        ranges.every(x => x === undefined) ||
        vimState.mode === Mode.Visual ||
        vimState.mode === Mode.VisualLine
      ) {
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

      if (linewise) {
        enterVisualLineMode(vimState);
      } else {
        enterVisualMode(vimState);
      }

      setModeCursorStyle(vimState.mode, editor);
    }
  ),
  parseKeysOperator(
    ["q"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (
        ranges.every(x => x === undefined) ||
        vimState.mode === Mode.Visual ||
        vimState.mode === Mode.VisualLine
      ) {
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

      vscode.commands.executeCommand("editor.action.copyLinesDownAction");
    }
  )
];

function cursorsToRangesStart(
  editor: vscode.TextEditor,
  ranges: (vscode.Range | undefined)[]
) {
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

function delete_(
  editor: vscode.TextEditor,
  ranges: (vscode.Range | undefined)[],
  linewise: boolean
) {
  editor
    .edit(editBuilder => {
      ranges.forEach(range => {
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
                new vscode.Position(
                  start.line - 1,
                  editor.document.lineAt(start.line - 1).text.length
                ),
                end
              );
            }
          } else {
            deleteRange = new vscode.Range(
              range.start,
              new vscode.Position(end.line + 1, 0)
            );
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
  vimState: VimState,
  editor: vscode.TextEditor,
  ranges: (vscode.Range | undefined)[],
  linewise: boolean
) {
  vimState.registers = {
    contentsList: ranges.map((range, i) => {
      if (range) {
        return editor.document.getText(range);
      } else {
        return vimState.registers.contentsList[i];
      }
    }),
    linewise: linewise
  };
}
