import * as vscode from 'vscode';

import { Action } from '../action_types';
import { HelixState } from '../helix_state_types';
import { Mode } from '../modes_types';
import { paragraphBackward, paragraphForward } from '../paragraph_utils';
import { parseKeysExact, parseKeysRegex } from '../parse_keys';
import * as positionUtils from '../position_utils';
import { searchBackward, searchForward } from '../search_utils';
import {
  vimToVscodeVisualLineSelection,
  vimToVscodeVisualSelection,
  vscodeToVimVisualLineSelection,
  vscodeToVimVisualSelection,
} from '../selection_utils';
import { setVisualLineSelections } from '../visual_line_utils';
import { setVisualSelections } from '../visual_utils';
import { whitespaceWordRanges, wordRanges } from '../word_utils';
import KeyMap from './keymaps';

export const motions: Action[] = [
  parseKeysExact([KeyMap.Motions.MoveRight], [Mode.Visual], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      return positionUtils.rightNormal(document, position, vimState.resolveCount());
    });
  }),

  parseKeysExact([KeyMap.Motions.MoveLeft], [Mode.Visual], (vimState, editor) => {
    execMotion(vimState, editor, ({ position }) => {
      return positionUtils.left(position, vimState.resolveCount());
    });
  }),

  parseKeysExact([KeyMap.Motions.MoveRight], [Mode.Normal], () => {
    vscode.commands.executeCommand('cursorRight');
  }),

  parseKeysExact([KeyMap.Motions.MoveLeft], [Mode.Normal], () => {
    vscode.commands.executeCommand('cursorLeft');
  }),

  parseKeysExact([KeyMap.Motions.MoveUp], [Mode.Normal], (_vimState, _editor) => {
    vscode.commands.executeCommand('cursorMove', {
      to: 'up',
      by: 'wrappedLine',
      value: _vimState.resolveCount(),
    });
  }),
  parseKeysExact([KeyMap.Motions.MoveUp], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand('cursorMove', {
        to: 'up',
        by: 'wrappedLine',
        select: true,
        value: vimState.resolveCount(),
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact([KeyMap.Motions.MoveUp], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand('cursorMove', { to: 'up', by: 'line', select: true, value: vimState.resolveCount() })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),

  parseKeysExact([KeyMap.Motions.MoveDown], [Mode.Normal], (_vimState, _editor) => {
    vscode.commands.executeCommand('cursorMove', {
      to: 'down',
      by: 'wrappedLine',
      value: _vimState.resolveCount(),
    });
  }),
  parseKeysExact([KeyMap.Motions.MoveDown], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand('cursorMove', {
        to: 'down',
        by: 'wrappedLine',
        select: true,
        value: vimState.resolveCount(),
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),

  parseKeysExact([KeyMap.Motions.MoveDown], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands.executeCommand('cursorMove', { to: 'down', by: 'line', select: true }).then(() => {
      setVisualLineSelections(editor);
    });
  }),

  parseKeysExact(['w'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordForwardHandler(wordRanges)(vimState, editor);
    }
  }),
  parseKeysExact(['W'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordForwardHandler(whitespaceWordRanges)(vimState, editor);
    }
  }),

  parseKeysExact(['b'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordBackwardHandler(wordRanges)(vimState, editor);
    }
  }),
  parseKeysExact(['B'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordBackwardHandler(whitespaceWordRanges)(vimState, editor);
    }
  }),

  parseKeysExact(['e'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordEndHandler(wordRanges)(vimState, editor);
    }
  }),
  parseKeysExact(['E'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    const count = vimState.resolveCount();
    for (let i = 0; i < count; i++) {
      createWordEndHandler(whitespaceWordRanges)(vimState, editor);
    }
  }),

  parseKeysRegex(/^f(.)$/, /^(f|f.)$/, [Mode.Normal, Mode.Visual], (vimState, editor, match) => {
    findForward(vimState, editor, match);

    vimState.repeatLastMotion = (innerVimState, innerEditor) => {
      findForward(innerVimState, innerEditor, match);
    };
  }),

  parseKeysRegex(/^F(.)$/, /^(F|F.)$/, [Mode.Normal, Mode.Visual], (vimState, editor, match) => {
    findBackward(vimState, editor, match);

    vimState.repeatLastMotion = (innerVimState, innerEditor) => {
      findBackward(innerVimState, innerEditor, match);
    };
  }),

  parseKeysRegex(/^t(.)$/, /^t$/, [Mode.Normal, Mode.Visual], (vimState, editor, match) => {
    tillForward(vimState, editor, match);

    vimState.repeatLastMotion = (innerVimState, innerEditor) => {
      tillForward(innerVimState, innerEditor, match);
    };
  }),

  parseKeysRegex(/^T(.)$/, /^T$/, [Mode.Normal, Mode.Visual], (vimState, editor, match) => {
    tillBackward(vimState, editor, match);

    vimState.repeatLastMotion = (innerVimState, innerEditor) => {
      tillBackward(innerVimState, innerEditor, match);
    };
  }),

  parseKeysExact(['}'], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      return new vscode.Position(paragraphForward(document, position.line), 0);
    });
  }),

  parseKeysExact([']', 'p'], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      return new vscode.Position(paragraphForward(document, position.line), 0);
    });
  }),

  parseKeysExact(['{'], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      return new vscode.Position(paragraphBackward(document, position.line), 0);
    });
  }),

  parseKeysExact(['[', 'p'], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      return new vscode.Position(paragraphBackward(document, position.line), 0);
    });
  }),

  parseKeysExact([KeyMap.Motions.MoveLineEnd], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineLength = document.lineAt(position.line).text.length;
      return position.with({ character: Math.max(lineLength - 1, 0) });
    });
  }),

  parseKeysExact([KeyMap.Motions.MoveLineStart], [Mode.Normal, Mode.Visual, Mode.VisualLine], (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const line = document.lineAt(position.line);
      return position.with({
        character: line.firstNonWhitespaceCharacterIndex,
      });
    });
  }),

  parseKeysExact(['H'], [Mode.Normal], (_vimState, _editor) => {
    vscode.commands.executeCommand('cursorMove', {
      to: 'viewPortTop',
      by: 'line',
    });
  }),
  parseKeysExact(['H'], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortTop',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(['H'], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortTop',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),

  parseKeysExact(['M'], [Mode.Normal], (_vimState, _editor) => {
    vscode.commands.executeCommand('cursorMove', {
      to: 'viewPortCenter',
      by: 'line',
    });
  }),
  parseKeysExact(['M'], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortCenter',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(['M'], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortCenter',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),

  parseKeysExact(['L'], [Mode.Normal], (_vimState, _editor) => {
    vscode.commands.executeCommand('cursorMove', {
      to: 'viewPortBottom',
      by: 'line',
    });
  }),
  parseKeysExact(['L'], [Mode.Visual], (vimState, editor) => {
    const originalSelections = editor.selections;

    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortBottom',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualSelections(editor, originalSelections);
      });
  }),
  parseKeysExact(['L'], [Mode.VisualLine], (vimState, editor) => {
    vscode.commands
      .executeCommand('cursorMove', {
        to: 'viewPortBottom',
        by: 'line',
        select: true,
      })
      .then(() => {
        setVisualLineSelections(editor);
      });
  }),
];

type MotionArgs = {
  document: vscode.TextDocument;
  position: vscode.Position;
  selectionIndex: number;
  vimState: HelixState;
};

type RegexMotionArgs = {
  document: vscode.TextDocument;
  position: vscode.Position;
  selectionIndex: number;
  vimState: HelixState;
  match: RegExpMatchArray;
};

function execRegexMotion(
  vimState: HelixState,
  editor: vscode.TextEditor,
  match: RegExpMatchArray,
  regexMotion: (args: RegexMotionArgs) => vscode.Position,
) {
  return execMotion(vimState, editor, (motionArgs) => {
    return regexMotion({
      ...motionArgs,
      match: match,
    });
  });
}

function execMotion(vimState: HelixState, editor: vscode.TextEditor, motion: (args: MotionArgs) => vscode.Position) {
  const document = editor.document;

  const newSelections = editor.selections.map((selection, i) => {
    if (vimState.mode === Mode.Normal) {
      const newPosition = motion({
        document: document,
        position: selection.active,
        selectionIndex: i,
        vimState: vimState,
      });
      return new vscode.Selection(selection.active, newPosition);
    } else if (vimState.mode === Mode.Visual) {
      const vimSelection = vscodeToVimVisualSelection(document, selection);
      const motionPosition = motion({
        document: document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState: vimState,
      });

      return vimToVscodeVisualSelection(document, new vscode.Selection(vimSelection.anchor, motionPosition));
    } else if (vimState.mode === Mode.VisualLine) {
      const vimSelection = vscodeToVimVisualLineSelection(document, selection);
      const motionPosition = motion({
        document: document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState: vimState,
      });

      return vimToVscodeVisualLineSelection(document, new vscode.Selection(vimSelection.anchor, motionPosition));
    } else {
      return selection;
    }
  });

  editor.selections = newSelections;

  editor.revealRange(
    new vscode.Range(newSelections[0].active, newSelections[0].active),
    vscode.TextEditorRevealType.InCenterIfOutsideViewport,
  );
}

function findForward(vimState: HelixState, editor: vscode.TextEditor, outerMatch: RegExpMatchArray): void {
  execRegexMotion(vimState, editor, outerMatch, ({ document, position, match }) => {
    const fromPosition = position.with({ character: position.character + 1 });
    const result = searchForward(document, match[1], fromPosition);

    if (result) {
      return result.with({ character: result.character + 1 });
    } else {
      return position;
    }
  });
}

function findBackward(vimState: HelixState, editor: vscode.TextEditor, outerMatch: RegExpMatchArray): void {
  execRegexMotion(vimState, editor, outerMatch, ({ document, position, match }) => {
    const fromPosition = positionLeftWrap(document, position);
    const result = searchBackward(document, match[1], fromPosition);

    if (result) {
      return result;
    } else {
      return position;
    }
  });
}

function tillForward(vimState: HelixState, editor: vscode.TextEditor, outerMatch: RegExpMatchArray): void {
  execRegexMotion(vimState, editor, outerMatch, ({ document, position, match }) => {
    const fromPosition = position.with({ character: position.character + 1 });
    const result = searchForward(document, match[1], fromPosition);

    if (result) {
      return result.with({ character: result.character });
    } else {
      return position;
    }
  });
}

function tillBackward(vimState: HelixState, editor: vscode.TextEditor, outerMatch: RegExpMatchArray): void {
  execRegexMotion(vimState, editor, outerMatch, ({ document, position, match }) => {
    const fromPosition = positionLeftWrap(document, position);
    const result = searchBackward(document, match[1], fromPosition);

    if (result) {
      return result;
    } else {
      return position;
    }
  });
}

function positionLeftWrap(document: vscode.TextDocument, position: vscode.Position): vscode.Position {
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
  wordRangesFunction: (text: string) => { start: number; end: number }[],
): (vimState: HelixState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      let character = position.character;
      // Try the current line and if we're at the end go to the next line
      // This way we're only keeping one line of text in memory at a time
      // i is representing the relative line number we're on from where we started
      for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(position.line + i).text;
        const ranges = wordRangesFunction(lineText);

        const result = ranges.find((x) => x.start > character);

        if (result) {
          if (vimState.mode === Mode.Normal) {
            return position.with({ character: result.start, line: position.line + i });
          } else {
            return position.with({ character: result.start-1, line: position.line + i });
          }
        }
        // If we don't find anything on this line, search the next and reset the character to 0
        character = 0;
      }

      // We may be at the end of the document or nothing else matches
      return position;
    });
  };
}

function createWordBackwardHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[],
): (vimState: HelixState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      let character = position.character;
      // Try the current line and if we're at the end go to the next line
      // This way we're only keeping one line of text in memory at a time
      // i is representing the relative line number we're on from where we started
      for (let i = position.line; i >= 0; i--) {
        const lineText = document.lineAt(i).text;
        const ranges = wordRangesFunction(lineText);

        const result = ranges.reverse().find((x) => x.start < character);

        if (result) {
          return position.with({ character: result.start, line: i });
        }

        // If we don't find anything on this line, search the next and reset the character to 0
        character = Infinity;
      }
      // We may be at the end of the document or nothing else matches
      return position;
    });
  };
}

function createWordEndHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[],
): (vimState: HelixState, editor: vscode.TextEditor) => void {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);

      const result = ranges.find((x) => x.end > position.character);

      if (result) {
        if (vimState.mode === Mode.Normal) {
          return position.with({ character: result.end + 1 });
        } else {
          return position.with({ character: result.end });
        }
      } else {
        return position;
      }
    });
  };
}
