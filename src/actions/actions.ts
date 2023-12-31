import * as vscode from 'vscode';
import { Action } from '../action_types';
import { HelixState } from '../helix_state_types';
import {
  enterInsertMode,
  enterSearchMode,
  enterSelectMode,
  enterVisualLineMode,
  enterVisualMode,
  setModeCursorStyle,
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
import { yank } from './operators';
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

  parseKeysExact(['n'], [Mode.Normal], () => {
    vscode.commands.executeCommand('editor.action.nextMatchFindAction');
  }),

  parseKeysExact(['N'], [Mode.Normal], () => {
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

  parseKeysExact(['*'], [Mode.Normal], (_) => {
    vscode.commands.executeCommand('actions.findWithSelection');
  }),

  parseKeysExact(['d'], [Mode.Normal], (_) => {
    vscode.commands.executeCommand('deleteRight');
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
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['a'], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = positionUtils.right(editor.document, selection.active);
      return new vscode.Selection(newPosition, newPosition);
    });

    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
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
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['v'], [Mode.Normal, Mode.VisualLine], (vimState, editor) => {
    if (vimState.mode === Mode.Normal) {
      editor.selections = editor.selections.map((selection) => {
        const lineLength = editor.document.lineAt(selection.active.line).text.length;

        if (lineLength === 0) return selection;

        return new vscode.Selection(selection.active, positionUtils.right(editor.document, selection.active));
      });
    }

    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),

  parseKeysExact(['x'], [Mode.Normal, Mode.Visual], () => {
    vscode.commands.executeCommand('expandLineSelection');
  }),

  parseKeysExact([KeyMap.Actions.NewLineBelow], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand('editor.action.insertLineAfter');
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact([KeyMap.Actions.NewLineAbove], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand('editor.action.insertLineBefore');
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['P'], [Mode.Normal, Mode.Visual, Mode.VisualLine], putAfter),
  parseKeysExact(['p'], [Mode.Normal], putBefore),

  parseKeysExact(['u'], [Mode.Normal, Mode.Visual, Mode.VisualLine], () => {
    vscode.commands.executeCommand('undo');
  }),

  parseKeysExact(['U'], [Mode.Normal, Mode.Visual, Mode.VisualLine], () => {
    vscode.commands.executeCommand('redo');
  }),

  parseKeysExact(['d', 'd'], [Mode.Normal], (vimState, editor) => {
    deleteLine(vimState, editor);
  }),

  parseKeysExact(['D'], [Mode.Normal], (vimState, editor) => {
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

  // these allow you to the delete n lines above/below
  // ex. d12i = delete 12 lines up
  parseKeysRegex(
    RegExp(`^d(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(d|d\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines down`);
      deleteLines(vimState, editor, lineCount, direction);
    },
  ),

  // same for change command
  parseKeysRegex(
    RegExp(`^c(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(c|c\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines down`);
      deleteLines(vimState, editor, lineCount, direction);

      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    },
  ),

  // same for selection command
  parseKeysRegex(
    RegExp(`^s(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(s|s\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      editor.selections = makeMultiLineSelection(vimState, editor, lineCount, direction);
    },
  ),

  // same for yank command
  parseKeysRegex(
    RegExp(`^y(\\d+)(${KeyMap.Motions.MoveUp}|${KeyMap.Motions.MoveDown})$`),
    /^(y|y\d+)$/,
    [Mode.Normal, Mode.Visual],
    (vimState, editor, match) => {
      const lineCount = parseInt(match[1]);
      const direction = match[2] == KeyMap.Motions.MoveUp ? Direction.Up : Direction.Down;
      // console.log(`delete ${lineCount} lines up`);
      const selections = makeMultiLineSelection(vimState, editor, lineCount, direction);

      yank(vimState, editor, selections, true);

      flashYankHighlight(editor, selections);
    },
  ),

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
    removeTypeSubscription(vimState);
  }),

  parseKeysExact(['C'], [Mode.Normal], (vimState, editor) => {
    vscode.commands.executeCommand('deleteAllRight');
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
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

  parseKeysExact(['Y'], [Mode.Normal], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);

    // Yank highlight
    const highlightRanges = editor.selections.map((selection) => {
      const lineLength = editor.document.lineAt(selection.active.line).text.length;
      return new vscode.Range(selection.active, selection.active.with({ character: lineLength }));
    });
    flashYankHighlight(editor, highlightRanges);
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

  parseKeysExact(['R'], [Mode.Normal], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);
    vscode.commands.executeCommand('deleteAllRight');
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
  }),

  parseKeysExact(['S'], [Mode.Normal], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      return new vscode.Selection(selection.active, positionUtils.lineEnd(editor.document, selection.active));
    });

    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),

  // parseKeysExact(['h'], [Mode.Normal], (vimState, editor) => {
  //   vscode.commands.executeCommand('deleteLeft')
  // }),

  parseKeysExact([';'], [Mode.Normal], (vimState, editor) => {
    vimState.semicolonAction(vimState, editor);
  }),

  parseKeysExact([','], [Mode.Normal], (vimState, editor) => {
    vimState.commaAction(vimState, editor);
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

function yankToEndOfLine(vimState: HelixState, editor: vscode.TextEditor): void {
  vimState.registers = {
    contentsList: editor.selections.map((selection) => {
      return editor.document.lineAt(selection.active.line).text.substring(selection.active.character);
    }),
    linewise: false,
  };
}
