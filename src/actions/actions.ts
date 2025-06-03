import * as vscode from 'vscode';
import { Action } from '../action_types';
import { HelixState } from '../helix_state_types';
import {
  enterCommandMode,
  enterInsertMode,
  enterNormalMode,
  enterSearchMode,
  enterSelectMode,
  enterVisualLineMode,
  enterVisualMode,
  setModeCursorStyle,
  setRelativeLineNumbers,
} from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact, parseKeysRegex } from '../parse_keys';
import * as positionUtils from '../position_utils';
import { putAfter } from '../put_utils/put_after';
import { putBefore } from '../put_utils/put_before';
import { removeTypeSubscription } from '../type_subscription';
import { flashYankHighlight } from '../yank_highlight';
import { gotoActions } from './gotoMode';
import KeyMap from './keymaps';
import { matchActions } from './matchMode';
import { isSingleLineRange, yank } from './operators';
import { spaceActions } from './spaceMode';
import { unimparedActions } from './unimpared';
import { viewActions } from './viewMode';
import { windowActions } from './windowMode';

enum Direction {
  Up,
  Down,
}

export const actions: Action[] = [
  parseKeysExact(['p'], [Mode.Occurrence], () => {
    vscode.commands.executeCommand('editor.action.addSelectionToPreviousFindMatch');
  }),

  parseKeysExact(['a'], [Mode.Occurrence], () => {
    vscode.commands.executeCommand('editor.action.selectHighlights');
  }),

  parseKeysExact(['n'], [Mode.Normal], (helixState) => {
    if (helixState.searchState.selectModeActive) {
      vscode.commands.executeCommand('actions.findWithSelection');
      helixState.searchState.selectModeActive = false;
      return;
    }

    vscode.commands.executeCommand('editor.action.nextMatchFindAction');
  }),

  parseKeysExact(['N'], [Mode.Normal], (helixState) => {
    if (helixState.searchState.selectModeActive) {
      vscode.commands.executeCommand('actions.findWithSelection');
      helixState.searchState.selectModeActive = false;
      return;
    }
    vscode.commands.executeCommand('editor.action.previousMatchFindAction');
  }),

  parseKeysExact(['?'], [Mode.Normal], (helixState) => {
    enterSearchMode(helixState);
    helixState.searchState.previousSearchResult(helixState);
  }),

  // Selection Stuff
  parseKeysExact(['s'], [Mode.Normal, Mode.Visual], (helixState, editor) => {
    enterSelectMode(helixState);
    // if we enter select mode we should save the current selection
    helixState.currentSelection = editor.selection;
  }),

  parseKeysExact([','], [Mode.Normal, Mode.Visual], (_, editor) => {
    // Keep primary selection only
    editor.selections = editor.selections.slice(0, 1);
  }),

  parseKeysExact(['/'], [Mode.Normal], (helixState) => {
    enterSearchMode(helixState);
  }),

  parseKeysExact([':'], [Mode.Normal], (helixState) => {
    enterCommandMode(helixState);
  }),

  parseKeysExact(['*'], [Mode.Normal], (_) => {
    vscode.commands.executeCommand('actions.findWithSelection');
  }),

  parseKeysExact(['>'], [Mode.Normal, Mode.Visual], (_) => {
    vscode.commands.executeCommand('editor.action.indentLines');
  }),

  parseKeysExact(['<'], [Mode.Normal, Mode.Visual], (_) => {
    vscode.commands.executeCommand('editor.action.outdentLines');
  }),

  parseKeysExact(['='], [Mode.Normal, Mode.Visual], (_) => {
    vscode.commands.executeCommand('editor.action.formatSelection');
  }),

  parseKeysExact(['`'], [Mode.Normal], (vimState, editor) => {
    // Take the selection and make it all lowercase
    editor.edit((editBuilder) => {
      editor.selections.forEach((selection) => {
        const text = editor.document.getText(selection);
        editBuilder.replace(selection, text.toLowerCase());
      });
    });
  }),

  parseKeysExact(['~'], [Mode.Normal], (vimState, editor) => {
    // Switch the case of the selection (so if upper case make lower case and vice versa)
    editor.edit((editBuilder) => {
      editor.selections.forEach((selection) => {
        const text = editor.document.getText(selection);
        editBuilder.replace(
          selection,
          text.replace(/./g, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())),
        );
      });
    });
  }),

  // 	replace
  parseKeysRegex(/^r(.)/, /^r/, [Mode.Normal], (helixState, editor, match) => {
    const position = editor.selection.active;
    editor.edit((builder) => {
      builder.replace(new vscode.Range(position, position.with({ character: position.character + 1 })), match[1]);
    });
  }),

  // existing
  parseKeysExact(
    [KeyMap.Actions.InsertMode],
    [Mode.Normal, Mode.Visual, Mode.VisualLine, Mode.Occurrence],
    (vimState, editor) => {
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      setRelativeLineNumbers(vimState.mode, editor);
      removeTypeSubscription(vimState);
    },
  ),

  parseKeysExact([KeyMap.Actions.InsertAtLineStart], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      const character = editor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
      const newPosition = selection.active.with({ character: character });
      return new vscode.Selection(newPosition, newPosition);
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['a'], [Mode.Normal], (vimState, editor) => {
    enterInsertMode(vimState, false);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact([KeyMap.Actions.InsertAtLineEnd], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      const lineLength = editor.document.lineAt(selection.active.line).text.length;
      const newPosition = selection.active.with({ character: lineLength });
      return new vscode.Selection(newPosition, newPosition);
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['v'], [Mode.Normal, Mode.VisualLine], (vimState, editor) => {
    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  }),

  parseKeysExact(['x'], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand('expandLineSelection');
  }),

  parseKeysExact([KeyMap.Actions.NewLineBelow], [Mode.Normal], (vimState, editor) => {
    enterInsertMode(vimState);
    vscode.commands.executeCommand('editor.action.insertLineAfter');
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact([KeyMap.Actions.NewLineAbove], [Mode.Normal], (vimState, editor) => {
    enterInsertMode(vimState);
    vscode.commands.executeCommand('editor.action.insertLineBefore');
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['p'], [Mode.Normal, Mode.Visual, Mode.VisualLine], putAfter),
  parseKeysExact(['P'], [Mode.Normal], putBefore),

  parseKeysExact(['u'], [Mode.Normal, Mode.Visual, Mode.VisualLine], () => {
    vscode.commands.executeCommand('undo');
  }),

  parseKeysExact(['U'], [Mode.Normal, Mode.Visual, Mode.VisualLine], () => {
    vscode.commands.executeCommand('redo');
  }),

  parseKeysExact(['d', 'd'], [Mode.Normal], (vimState, editor) => {
    deleteLine(vimState, editor);
  }),

  parseKeysExact(['D'], [Mode.Normal], () => {
    vscode.commands.executeCommand('deleteAllRight');
  }),

  parseKeysRegex(/(\\d+)g/, /^g$/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    new vscode.Position(parseInt(match[1]), 0);
  }),

  // add 1 character swap
  parseKeysRegex(/^x(.)$/, /^x$/, [Mode.Normal, Mode.Visual], (vimState, editor, match) => {
    editor.edit((builder) => {
      editor.selections.forEach((s) => {
        const oneChar = s.with({
          end: s.active.with({
            character: s.active.character + 1,
          }),
        });
        builder.replace(oneChar, match[1]);
      });
    });
  }),

  // same for rip command
  parseKeysRegex(
    RegExp(`^r(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(r|r\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      const selections = makeMultiLineSelection(vimState, editor, lineCount, direction);

      yank(vimState, editor, selections, true);

      deleteLines(vimState, editor, lineCount, direction);
    },
  ),

  // same for duplicate command
  parseKeysRegex(
    RegExp(`^q(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(q|q\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      editor.selections = makeMultiLineSelection(vimState, editor, lineCount, direction);
      vscode.commands.executeCommand('editor.action.copyLinesDownAction');
    },
  ),

  parseKeysExact(['c', 'c'], [Mode.Normal], (vimState, editor) => {
    editor.edit((editBuilder) => {
      editor.selections.forEach((selection) => {
        const line = editor.document.lineAt(selection.active.line);
        editBuilder.delete(
          new vscode.Range(
            selection.active.with({
              character: line.firstNonWhitespaceCharacterIndex,
            }),
            selection.active.with({ character: line.text.length }),
          ),
        );
      });
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['C'], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand('deleteAllRight');
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['y', 'y'], [Mode.Normal], (vimState, editor) => {
    yankLine(vimState, editor);

    // Yank highlight
    const highlightRanges = editor.selections.map((selection) => {
      const lineLength = editor.document.lineAt(selection.active.line).text.length;
      return new vscode.Range(
        selection.active.with({ character: 0 }),
        selection.active.with({ character: lineLength }),
      );
    });
    flashYankHighlight(editor, highlightRanges);
  }),

  parseKeysExact(['y'], [Mode.Normal, Mode.Visual], (vimState, editor) => {
    // Yank highlight
    const highlightRanges = editor.selections.map((selection) => selection.with());

    // We need to detect if the ranges are lines because we need to handle them differently
    highlightRanges.every((range) => isSingleLineRange(range));
    yank(vimState, editor, highlightRanges, false);
    flashYankHighlight(editor, highlightRanges);
    if (vimState.mode === Mode.Visual) {
      enterNormalMode(vimState);
    }
  }),

  parseKeysExact(['q', 'q'], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand('editor.action.copyLinesDownAction');
  }),

  parseKeysExact(['Q', 'Q'], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand('editor.action.copyLinesUpAction');
  }),

  parseKeysExact(['r', 'r'], [Mode.Normal], (vimState, editor) => {
    yankLine(vimState, editor);
    deleteLine(vimState, editor);
  }),

  parseKeysExact(['s', 's'], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      return new vscode.Selection(
        selection.active.with({ character: 0 }),
        positionUtils.lineEnd(editor.document, selection.active),
      );
    });

    enterVisualLineMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  }),

  parseKeysExact(['S'], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      return new vscode.Selection(selection.active, positionUtils.lineEnd(editor.document, selection.active));
    });

    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setRelativeLineNumbers(vimState.mode, editor);
  }),

  // parseKeysExact(['h'], [Mode.Normal], (vimState, editor) => {
  //   vscode.commands.executeCommand('deleteLeft')
  // }),

  parseKeysExact([';'], [Mode.Normal], (vimState, editor) => {
    const active = editor.selection.active;
    editor.selection = new vscode.Selection(active, active);
  }),

  ...gotoActions,
  ...windowActions,
  ...viewActions,
  ...spaceActions,
  ...matchActions,
  ...unimparedActions,
];

function makeMultiLineSelection(
  vimState: HelixState,
  editor: vscode.TextEditor,
  lineCount: number,
  direction: Direction,
): vscode.Selection[] {
  return editor.selections.map((selection) => {
    if (direction == Direction.Up) {
      const endLine = selection.active.line - lineCount + 1;
      const startPos = positionUtils.lineEnd(editor.document, selection.active);
      const endPos = endLine >= 0 ? new vscode.Position(endLine, 0) : new vscode.Position(0, 0);
      return new vscode.Selection(startPos, endPos);
    } else {
      const endLine = selection.active.line + lineCount - 1;
      const startPos = new vscode.Position(selection.active.line, 0);
      const endPos =
        endLine < editor.document.lineCount
          ? new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
          : positionUtils.lastChar(editor.document);

      return new vscode.Selection(startPos, endPos);
    }
  });
}

function deleteLines(
  vimState: HelixState,
  editor: vscode.TextEditor,
  lineCount: number,
  direction: Direction = Direction.Down,
): void {
  const selections = editor.selections.map((selection) => {
    if (direction == Direction.Up) {
      const endLine = selection.active.line - lineCount;
      if (endLine >= 0) {
        const startPos = positionUtils.lineEnd(editor.document, selection.active);
        const endPos = new vscode.Position(endLine, editor.document.lineAt(endLine).text.length);
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
      const endLine = selection.active.line + lineCount;
      if (endLine <= editor.document.lineCount - 1) {
        const startPos = new vscode.Position(selection.active.line, 0);
        const endPos = new vscode.Position(endLine, 0);
        return new vscode.Selection(startPos, endPos);
      } else {
        const startPos =
          selection.active.line - 1 >= 0
            ? new vscode.Position(
                selection.active.line - 1,
                editor.document.lineAt(selection.active.line - 1).text.length,
              )
            : new vscode.Position(selection.active.line, 0);

        const endPos = positionUtils.lastChar(editor.document);
        return new vscode.Selection(startPos, endPos);
      }
    }
  });

  editor
    .edit((builder) => {
      selections.forEach((sel) => builder.replace(sel, ''));
    })
    .then(() => {
      editor.selections = editor.selections.map((selection) => {
        const character = editor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
        const newPosition = selection.active.with({ character: character });
        return new vscode.Selection(newPosition, newPosition);
      });
    });
}

function deleteLine(vimState: HelixState, editor: vscode.TextEditor, direction: Direction = Direction.Down): void {
  deleteLines(vimState, editor, 1, direction);
}

function yankLine(vimState: HelixState, editor: vscode.TextEditor): void {
  vimState.registers = {
    contentsList: editor.selections.map((selection) => {
      return editor.document.lineAt(selection.active.line).text;
    }),
    linewise: true,
  };
}

export function switchToUppercase(editor: vscode.TextEditor): void {
  editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      const text = editor.document.getText(selection);
      editBuilder.replace(selection, text.toUpperCase());
    });
  });
}

export function incremenet(editor: vscode.TextEditor): void {
  // Move the cursor to the first number and incremene the number
  // If the cursor is not on a number, then do nothing
  editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      const translatedSelection = selection.with(selection.start, selection.start.translate(0, 1));
      const text = editor.document.getText(translatedSelection);
      const number = parseInt(text, 10);
      if (!isNaN(number)) {
        editBuilder.replace(translatedSelection, (number + 1).toString());
      }
    });
  });
}

export function decrement(editor: vscode.TextEditor): void {
  // Move the cursor to the first number and incremene the number
  // If the cursor is not on a number, then do nothing
  editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      const translatedSelection = selection.with(selection.start, selection.start.translate(0, 1));
      const text = editor.document.getText(translatedSelection);
      const number = parseInt(text, 10);
      if (!isNaN(number)) {
        editBuilder.replace(translatedSelection, (number - 1).toString());
      }
    });
  });
}
