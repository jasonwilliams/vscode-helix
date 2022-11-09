import * as vscode from "vscode";

import { Mode } from "../modes_types";
import { Action } from "../action_types";
import { parseKeysExact, parseKeysRegex } from "../parse_keys";
import {
  enterInsertMode,
  enterVisualMode,
  enterVisualLineMode,
  enterOccurrenceMode,
  setModeCursorStyle
} from "../modes";
import * as positionUtils from "../position_utils";
import { removeTypeSubscription } from "../type_subscription";
import { VimState } from "../vim_state_types";
import { setVisualLineSelections } from "../visual_line_utils";
import { flashYankHighlight } from "../yank_highlight";
import { putAfter } from "../put_utils/put_after";
import { putBefore } from "../put_utils/put_before";
import { yank } from "./operators";
import KeyMap from "./keymaps";

enum Direction {
  Up,
  Down
}

export const actions: Action[] = [
  parseKeysExact([":"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("workbench.action.gotoLine");
  }),

  parseKeysExact(["m", "l"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("bookmarks.list");
  }),

  parseKeysExact(["m", "L"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("bookmarks.listFromAllFiles");
  }),

  parseKeysExact(["m", "i"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("bookmarks.jumpToPrevious");
  }),

  parseKeysExact(["m", "k"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("bookmarks.jumpToNext");
  }),

  parseKeysExact(["m", "m"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("bookmarks.toggle");
  }),

  // new space actions
  parseKeysExact([" ", " "], [Mode.Normal], (vimState, editor) => {
    enterOccurrenceMode(vimState);
    vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
  }),

  parseKeysExact(["p"], [Mode.Occurrence], (vimState, editor) => {
    vscode.commands.executeCommand(
      "editor.action.addSelectionToPreviousFindMatch"
    );
  }),

  parseKeysExact(["n"], [Mode.Occurrence], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
  }),

  parseKeysExact(["a"], [Mode.Occurrence], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.selectHighlights");
  }),

  parseKeysExact([" ", "z"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("undo");
  }),

  parseKeysExact([" ", "r"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("redo");
  }),

  parseKeysExact([" ", "i"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("extension.simpleVim.scrollUpHalfPage");
  }),

  parseKeysExact([" ", "k"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("extension.simpleVim.scrollDownHalfPage");
  }),

  // new G actions
  parseKeysExact(["g", "l"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand(
      "workbench.action.navigateToLastEditLocation"
    );
  }),

  parseKeysExact(["g", "R"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("references-view.find");
  }),

  parseKeysExact(["g", "r"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.referenceSearch.trigger");
  }),

  parseKeysExact(["g", "d"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.revealDefinition");
  }),

  parseKeysExact(["g", "D"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.revealDefinitionAside");
  }),

  parseKeysExact(["g", "p"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.peekDefinition");
  }),

  parseKeysExact(["g", "s"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("extension.dash.specific");
  }),

  parseKeysExact(["g", "h"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.showHover");
  }),

  parseKeysExact(["g", "U"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.transformToUppercase");
  }),

  parseKeysExact(["g", "u"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("editor.action.transformToLowercase");
  }),

  // existing
  parseKeysExact(
    [KeyMap.Actions.InsertMode],
    [Mode.Normal, Mode.Visual, Mode.VisualLine, Mode.Occurrence],
    (vimState, editor) => {
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  parseKeysExact(
    [KeyMap.Actions.InsertAtLineStart],
    [Mode.Normal],
    (vimState, editor) => {
      editor.selections = editor.selections.map(selection => {
        const character = editor.document.lineAt(selection.active.line)
          .firstNonWhitespaceCharacterIndex;
        const newPosition = selection.active.with({ character: character });
        return new vscode.Selection(newPosition, newPosition);
      });

      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  parseKeysExact(["a"], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map(selection => {
      const newPosition = positionUtils.right(
        editor.document,
        selection.active
      );
      return new vscode.Selection(newPosition, newPosition);
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(
    [KeyMap.Actions.InsertAtLineEnd],
    [Mode.Normal],
    (vimState, editor) => {
      editor.selections = editor.selections.map(selection => {
        const lineLength = editor.document.lineAt(selection.active.line).text
          .length;
        const newPosition = selection.active.with({ character: lineLength });
        return new vscode.Selection(newPosition, newPosition);
      });

      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  parseKeysExact(["v"], [Mode.Normal, Mode.VisualLine], (vimState, editor) => {
    if (vimState.mode === Mode.Normal) {
      editor.selections = editor.selections.map(selection => {
        const lineLength = editor.document.lineAt(selection.active.line).text
          .length;

        if (lineLength === 0) return selection;

        return new vscode.Selection(
          selection.active,
          positionUtils.right(editor.document, selection.active)
        );
      });
    }

    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),

  parseKeysExact(["V"], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    enterVisualLineMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setVisualLineSelections(editor);
  }),

  parseKeysExact(
    [KeyMap.Actions.NewLineBelow],
    [Mode.Normal],
    (vimState, editor) => {
      vscode.commands.executeCommand("editor.action.insertLineAfter");
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  parseKeysExact(
    [KeyMap.Actions.NewLineAbove],
    [Mode.Normal],
    (vimState, editor) => {
      vscode.commands.executeCommand("editor.action.insertLineBefore");
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  parseKeysExact(["P"], [Mode.Normal, Mode.Visual, Mode.VisualLine], putAfter),
  parseKeysExact(["p"], [Mode.Normal], putBefore),

  //   parseKeysExact(
  //     ["u"],
  //     [Mode.Normal, Mode.Visual, Mode.VisualLine],
  //     (vimState, editor) => {
  //       vscode.commands.executeCommand("undo");
  //     }
  //   ),

  parseKeysExact(["d", "d"], [Mode.Normal], (vimState, editor) => {
    deleteLine(vimState, editor);
  }),

  parseKeysExact(["D"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("deleteAllRight");
  }),

  // add 1 character swap
  parseKeysRegex(
    /^x(.)$/,
    /^x$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      editor.edit(builder => {
        editor.selections.forEach(s => {
          let oneChar = s.with({
            end: s.active.with({
              character: s.active.character + 1
            })
          });
          builder.replace(oneChar, match[1]);
        });
      });
    }
  ),

  // these allow you to the delete n lines above/below
  // ex. d12i = delete 12 lines up
  parseKeysRegex(
    RegExp(`^d(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(d|d\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines down`);
      deleteLines(vimState, editor, lineCount, direction);
    }
  ),

  // same for change command
  parseKeysRegex(
    RegExp(`^c(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(c|c\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines down`);
      deleteLines(vimState, editor, lineCount, direction);

      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),

  // same for selection command
  parseKeysRegex(
    RegExp(`^s(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(s|s\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      editor.selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
    }
  ),

  // same for yank command
  parseKeysRegex(
    RegExp(`^y(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(y|y\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      let selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );

      yank(vimState, editor, selections, true);

      flashYankHighlight(editor, selections);
    }
  ),

  // same for rip command
  parseKeysRegex(
    RegExp(`^r(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(r|r\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      let selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );

      yank(vimState, editor, selections, true);

      deleteLines(vimState, editor, lineCount, direction);
    }
  ),

  // same for duplicate command
  parseKeysRegex(
    RegExp(`^q(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(q|q\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction =
        match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      editor.selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
      vscode.commands.executeCommand("editor.action.copyLinesDownAction");
    }
  ),

  parseKeysExact(["c", "c"], [Mode.Normal], (vimState, editor) => {
    editor.edit(editBuilder => {
      editor.selections.forEach(selection => {
        const line = editor.document.lineAt(selection.active.line);
        editBuilder.delete(
          new vscode.Range(
            selection.active.with({
              character: line.firstNonWhitespaceCharacterIndex
            }),
            selection.active.with({ character: line.text.length })
          )
        );
      });
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(["C"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("deleteAllRight");
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(["y", "y"], [Mode.Normal], (vimState, editor) => {
    yankLine(vimState, editor);

    // Yank highlight
    const highlightRanges = editor.selections.map(selection => {
      const lineLength = editor.document.lineAt(selection.active.line).text
        .length;
      return new vscode.Range(
        selection.active.with({ character: 0 }),
        selection.active.with({ character: lineLength })
      );
    });
    flashYankHighlight(editor, highlightRanges);
  }),

  parseKeysExact(["Y"], [Mode.Normal], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);

    // Yank highlight
    const highlightRanges = editor.selections.map(selection => {
      const lineLength = editor.document.lineAt(selection.active.line).text
        .length;
      return new vscode.Range(
        selection.active,
        selection.active.with({ character: lineLength })
      );
    });
    flashYankHighlight(editor, highlightRanges);
  }),

  parseKeysExact(["q", "q"], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand("editor.action.copyLinesDownAction");
  }),

  parseKeysExact(["Q", "Q"], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand("editor.action.copyLinesUpAction");
  }),

  parseKeysExact(["r", "r"], [Mode.Normal], (vimState, editor) => {
    yankLine(vimState, editor);
    deleteLine(vimState, editor);
  }),

  parseKeysExact(["R"], [Mode.Normal], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);
    vscode.commands.executeCommand("deleteAllRight");
  }),

  parseKeysExact(["s", "s"], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map(selection => {
      return new vscode.Selection(
        selection.active.with({ character: 0 }),
        positionUtils.lineEnd(editor.document, selection.active)
      );
    });

    enterVisualLineMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),

  parseKeysExact(["S"], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map(selection => {
      return new vscode.Selection(
        selection.active,
        positionUtils.lineEnd(editor.document, selection.active)
      );
    });

    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),

  parseKeysExact(["h"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("deleteLeft");
  }),

  parseKeysExact(["n"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("deleteRight");
  }),

  parseKeysExact(
    ["z", KeyMap.Motions.MoveUp],
    [Mode.Normal],
    (vimState, editor) => {
      vscode.commands.executeCommand("revealLine", {
        lineNumber: editor.selection.active.line,
        at: "top"
      });
    }
  ),

  parseKeysExact(["z", "z"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("revealLine", {
      lineNumber: editor.selection.active.line,
      at: "center"
    });
  }),

  parseKeysExact(
    ["z", KeyMap.Motions.MoveDown],
    [Mode.Normal],
    (vimState, editor) => {
      vscode.commands.executeCommand("revealLine", {
        lineNumber: editor.selection.active.line,
        at: "bottom"
      });
    }
  ),

  parseKeysExact([";"], [Mode.Normal], (vimState, editor) => {
    vimState.semicolonAction(vimState, editor);
  }),

  parseKeysExact([","], [Mode.Normal], (vimState, editor) => {
    vimState.commaAction(vimState, editor);
  })
];

function makeMultiLineSelection(
  vimState: VimState,
  editor: vscode.TextEditor,
  lineCount: number,
  direction: Direction
): vscode.Selection[] {
  return editor.selections.map(selection => {
    if (direction == Direction.Up) {
      let endLine = selection.active.line - lineCount + 1;
      const startPos = positionUtils.lineEnd(editor.document, selection.active);
      const endPos =
        endLine >= 0
          ? new vscode.Position(endLine, 0)
          : new vscode.Position(0, 0);
      return new vscode.Selection(startPos, endPos);
    } else {
      const endLine = selection.active.line + lineCount - 1;
      const startPos = new vscode.Position(selection.active.line, 0);
      const endPos =
        endLine < editor.document.lineCount
          ? new vscode.Position(
              endLine,
              editor.document.lineAt(endLine).text.length
            )
          : positionUtils.lastChar(editor.document);

      return new vscode.Selection(startPos, endPos);
    }
  });
}

function deleteLines(
  vimState: VimState,
  editor: vscode.TextEditor,
  lineCount: number,
  direction: Direction = Direction.Down
): void {
  let selections = editor.selections.map(selection => {
    if (direction == Direction.Up) {
      let endLine = selection.active.line - lineCount;
      if (endLine >= 0) {
        const startPos = positionUtils.lineEnd(
          editor.document,
          selection.active
        );
        const endPos = new vscode.Position(
          endLine,
          editor.document.lineAt(endLine).text.length
        );
        return new vscode.Selection(startPos, endPos);
      } else {
        const startPos =
          selection.active.line + 1 <= editor.document.lineCount
            ? new vscode.Position(selection.active.line + 1, 0)
            : positionUtils.lineEnd(editor.document, selection.active);

        const endPos = new vscode.Position(0, 0);
        return new vscode.Selection(startPos, endPos);
      }
    } else {
      let endLine = selection.active.line + lineCount;
      if (endLine <= editor.document.lineCount - 1) {
        const startPos = new vscode.Position(selection.active.line, 0);
        const endPos = new vscode.Position(endLine, 0);
        return new vscode.Selection(startPos, endPos);
      } else {
        const startPos =
          selection.active.line - 1 >= 0
            ? new vscode.Position(
                selection.active.line - 1,
                editor.document.lineAt(selection.active.line - 1).text.length
              )
            : new vscode.Position(selection.active.line, 0);

        const endPos = positionUtils.lastChar(editor.document);
        return new vscode.Selection(startPos, endPos);
      }
    }
  });

  editor
    .edit(builder => {
      selections.forEach(sel => builder.replace(sel, ""));
    })
    .then(() => {
      editor.selections = editor.selections.map(selection => {
        const character = editor.document.lineAt(selection.active.line)
          .firstNonWhitespaceCharacterIndex;
        const newPosition = selection.active.with({ character: character });
        return new vscode.Selection(newPosition, newPosition);
      });
    });
}

function deleteLine(
  vimState: VimState,
  editor: vscode.TextEditor,
  direction: Direction = Direction.Down
): void {
  deleteLines(vimState, editor, 1, direction);
}

function yankLine(vimState: VimState, editor: vscode.TextEditor): void {
  vimState.registers = {
    contentsList: editor.selections.map(selection => {
      return editor.document.lineAt(selection.active.line).text;
    }),
    linewise: true
  };
}

function yankToEndOfLine(vimState: VimState, editor: vscode.TextEditor): void {
  vimState.registers = {
    contentsList: editor.selections.map(selection => {
      return editor.document
        .lineAt(selection.active.line)
        .text.substring(selection.active.character);
    }),
    linewise: false
  };
}
