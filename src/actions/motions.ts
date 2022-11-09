import * as vscode from "vscode";

import { Mode } from "../modes_types";
import { Action } from "../action_types";
import { parseKeysExact, parseKeysRegex } from "../parse_keys";
import {
  vscodeToVimVisualSelection,
  vimToVscodeVisualLineSelection,
  vimToVscodeVisualSelection,
  vscodeToVimVisualLineSelection
} from "../selection_utils";
import * as positionUtils from "../position_utils";
import { VimState } from "../vim_state_types";
import { wordRanges, whitespaceWordRanges } from "../word_utils";
import { searchForward, searchBackward } from "../search_utils";
import { paragraphForward, paragraphBackward } from "../paragraph_utils";
import { setVisualLineSelections } from "../visual_line_utils";
import { setVisualSelections } from "../visual_utils";
import KeyMap from "./keymaps";

export const motions: Action[] = [
  parseKeysExact(
    [KeyMap.Motions.MoveRight],
    [Mode.Normal, Mode.Visual],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return positionUtils.rightNormal(document, position);
      });
    }
  ),

  parseKeysExact(
    [KeyMap.Motions.MoveLeft],
    [Mode.Normal, Mode.Visual],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return positionUtils.left(position);
      });
    }
  ),

  parseKeysExact([KeyMap.Motions.MoveUp], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("cursorMove", {
      to: "up",
      by: "wrappedLine"
    });
  }),
  parseKeysExact([KeyMap.Motions.MoveUp], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand("cursorMove", {
        to: "up",
        by: "wrappedLine",
        select: true
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(
    [KeyMap.Motions.MoveUp],
    [Mode.VisualLine],
    (vimState, editor) => {
      vscode.commands
        .executeCommand("cursorMove", { to: "up", by: "line", select: true })
        .then(() => {
          setVisualLineSelections(editor);
        });
    }
  ),

  parseKeysExact(
    [KeyMap.Motions.MoveDown],
    [Mode.Normal],
    (vimState, editor) => {
      vscode.commands.executeCommand("cursorMove", {
        to: "down",
        by: "wrappedLine"
      });
    }
  ),
  parseKeysExact(
    [KeyMap.Motions.MoveDown],
    [Mode.Visual],
    (vimState, editor) => {
      const originalSelections = editor.selections;

      vscode.commands
        .executeCommand("cursorMove", {
          to: "down",
          by: "wrappedLine",
          select: true
        })
        .then(() => {
          setVisualSelections(editor, originalSelections);
        });
    }
  ),
  parseKeysExact(
    [KeyMap.Motions.MoveDown],
    [Mode.VisualLine],
    (vimState, editor) => {
      vscode.commands
        .executeCommand("cursorMove", { to: "down", by: "line", select: true })
        .then(() => {
          setVisualLineSelections(editor);
        });
    }
  ),

  parseKeysExact(
    ["w"],
    [Mode.Normal, Mode.Visual],
    createWordForwardHandler(wordRanges)
  ),
  parseKeysExact(
    ["W"],
    [Mode.Normal, Mode.Visual],
    createWordForwardHandler(whitespaceWordRanges)
  ),

  parseKeysExact(
    ["b"],
    [Mode.Normal, Mode.Visual],
    createWordBackwardHandler(wordRanges)
  ),
  parseKeysExact(
    ["B"],
    [Mode.Normal, Mode.Visual],
    createWordBackwardHandler(whitespaceWordRanges)
  ),

  parseKeysExact(
    ["e"],
    [Mode.Normal, Mode.Visual],
    createWordEndHandler(wordRanges)
  ),
  parseKeysExact(
    ["E"],
    [Mode.Normal, Mode.Visual],
    createWordEndHandler(whitespaceWordRanges)
  ),

  parseKeysRegex(
    /^f(..)$/,
    /^(f|f.)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      findForward(vimState, editor, match);

      vimState.semicolonAction = (innerVimState, innerEditor) => {
        findForward(innerVimState, innerEditor, match);
      };

      vimState.commaAction = (innerVimState, innerEditor) => {
        findBackward(innerVimState, innerEditor, match);
      };
    }
  ),

  parseKeysRegex(
    /^F(..)$/,
    /^(F|F.)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      findBackward(vimState, editor, match);

      vimState.semicolonAction = (innerVimState, innerEditor) => {
        findBackward(innerVimState, innerEditor, match);
      };

      vimState.commaAction = (innerVimState, innerEditor) => {
        findForward(innerVimState, innerEditor, match);
      };
    }
  ),

  parseKeysRegex(
    /^t(.)$/,
    /^t$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      tillForward(vimState, editor, match);

      vimState.semicolonAction = (innerVimState, innerEditor) => {
        tillForward(innerVimState, innerEditor, match);
      };

      vimState.commaAction = (innerVimState, innerEditor) => {
        tillBackward(innerVimState, innerEditor, match);
      };
    }
  ),

  parseKeysRegex(
    /^T(.)$/,
    /^T$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      tillBackward(vimState, editor, match);

      vimState.semicolonAction = (innerVimState, innerEditor) => {
        tillBackward(innerVimState, innerEditor, match);
      };

      vimState.commaAction = (innerVimState, innerEditor) => {
        tillForward(innerVimState, innerEditor, match);
      };
    }
  ),

  parseKeysExact(
    ["g", "g"],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode.Position(0, 0);
      });
    }
  ),

  parseKeysExact(
    ["G"],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode.Position(document.lineCount - 1, 0);
      });
    }
  ),

  parseKeysExact(
    ["}"],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode.Position(
          paragraphForward(document, position.line),
          0
        );
      });
    }
  ),

  parseKeysExact(
    ["{"],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode.Position(
          paragraphBackward(document, position.line),
          0
        );
      });
    }
  ),

  parseKeysExact(
    [KeyMap.Motions.MoveLineEnd],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        const lineLength = document.lineAt(position.line).text.length;
        return position.with({ character: Math.max(lineLength - 1, 0) });
      });
    }
  ),

  parseKeysExact(
    [KeyMap.Motions.MoveLineStart],
    [Mode.Normal, Mode.Visual, Mode.VisualLine],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        const line = document.lineAt(position.line);
        return position.with({
          character: line.firstNonWhitespaceCharacterIndex
        });
      });
    }
  ),

  parseKeysExact(["H"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("cursorMove", {
      to: "viewPortTop",
      by: "line"
    });
  }),
  parseKeysExact(["H"], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortTop",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(["H"], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortTop",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),

  parseKeysExact(["M"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("cursorMove", {
      to: "viewPortCenter",
      by: "line"
    });
  }),
  parseKeysExact(["M"], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortCenter",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(["M"], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortCenter",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),

  parseKeysExact(["L"], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand("cursorMove", {
      to: "viewPortBottom",
      by: "line"
    });
  }),
  parseKeysExact(["L"], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortBottom",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(["L"], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand("cursorMove", {
        to: "viewPortBottom",
        by: "line",
        select: true
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  })
];

type MotionArgs = {
  document: vscode.TextDocument;
  position: vscode.Position;
  selectionIndex: number;
  vimState: VimState;
};

type RegexMotionArgs = {
  document: vscode.TextDocument;
  position: vscode.Position;
  selectionIndex: number;
  vimState: VimState;
  match: RegExpMatchArray;
};

function execRegexMotion(
  vimState: VimState,
  editor: vscode.TextEditor,
  match: RegExpMatchArray,
  regexMotion: (args: RegexMotionArgs) => vscode.Position
) {
  return execMotion(vimState, editor, motionArgs => {
    return regexMotion({
      ...motionArgs,
      match: match
    });
  });
}

function execMotion(
  vimState: VimState,
  editor: vscode.TextEditor,
  motion: (args: MotionArgs) => vscode.Position
) {
  const document = editor.document;

  const newSelections = editor.selections.map((selection, i) => {
    if (vimState.mode === Mode.Normal) {
      const newPosition = motion({
        document: document,
        position: selection.active,
        selectionIndex: i,
        vimState: vimState
      });
      return new vscode.Selection(newPosition, newPosition);
    } else if (vimState.mode === Mode.Visual) {
      const vimSelection = vscodeToVimVisualSelection(document, selection);
      const motionPosition = motion({
        document: document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState: vimState
      });

      return vimToVscodeVisualSelection(
        document,
        new vscode.Selection(vimSelection.anchor, motionPosition)
      );
    } else if (vimState.mode === Mode.VisualLine) {
      const vimSelection = vscodeToVimVisualLineSelection(document, selection);
      const motionPosition = motion({
        document: document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState: vimState
      });

      return vimToVscodeVisualLineSelection(
        document,
        new vscode.Selection(vimSelection.anchor, motionPosition)
      );
    } else {
      return selection;
    }
  });

  editor.selections = newSelections;

  editor.revealRange(
    new vscode.Range(newSelections[0].active, newSelections[0].active),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport
  );
}

function findForward(
  vimState: VimState,
  editor: vscode.TextEditor,
  outerMatch: RegExpMatchArray
): void {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const fromPosition = position.with({ character: position.character + 1 });
      const result = searchForward(document, match[1], fromPosition);

      if (result) {
        return result;
      } else {
        return position;
      }
    }
  );
}

function findBackward(
  vimState: VimState,
  editor: vscode.TextEditor,
  outerMatch: RegExpMatchArray
): void {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const fromPosition = positionLeftWrap(document, position);
      const result = searchBackward(document, match[1], fromPosition);

      if (result) {
        return result;
      } else {
        return position;
      }
    }
  );
}

function tillForward(
  vimState: VimState,
  editor: vscode.TextEditor,
  outerMatch: RegExpMatchArray
): void {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.indexOf(match[1], position.character + 1);

      if (result >= 0) {
        return position.with({ character: result });
      } else {
        return position;
      }
    }
  );
}

function tillBackward(
  vimState: VimState,
  editor: vscode.TextEditor,
  outerMatch: RegExpMatchArray
): void {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.lastIndexOf(match[1], position.character - 1);

      if (result >= 0) {
        return position.with({ character: result });
      } else {
        return position;
      }
    }
  );
}

function positionLeftWrap(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position {
  if (position.character === 0) {
    if (position.line === 0) {
      return position;
    } else {
      const lineLength = document.lineAt(position.line - 1).text.length;
      return new vscode.Position(position.line - 1, lineLength);
    }
  } else {
    return position.with({ character: position.character - 1 });
  }
}

function createWordForwardHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (vimState: VimState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);

      const result = ranges.find(x => x.start > position.character);

      if (result) {
        return position.with({ character: result.start });
      } else {
        return position;
      }
    });
  };
}

function createWordBackwardHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (vimState: VimState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);

      const result = ranges.reverse().find(x => x.start < position.character);

      if (result) {
        return position.with({ character: result.start });
      } else {
        return position;
      }
    });
  };
}

function createWordEndHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (vimState: VimState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);

      const result = ranges.find(x => x.end > position.character);

      if (result) {
        return position.with({ character: result.end });
      } else {
        return position;
      }
    });
  };
}
