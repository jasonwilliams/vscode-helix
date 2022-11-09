import * as vscode from "vscode";

import * as positionUtils from "../position_utils";
import { VimState } from "../vim_state_types";
import { Mode } from "../modes_types";
import { enterNormalMode, setModeCursorStyle } from "../modes";
import {
  getRegisterContentsList,
  adjustInsertPositions,
  getInsertRangesFromBeginning,
  getInsertRangesFromEnd
} from "./common";

export function putAfter(vimState: VimState, editor: vscode.TextEditor) {
  const registerContentsList = getRegisterContentsList(vimState, editor);
  if (registerContentsList === undefined) return;

  if (vimState.mode === Mode.Normal) {
    if (vimState.registers.linewise) {
      normalModeLinewise(vimState, editor, registerContentsList);
    } else {
      normalModeCharacterwise(vimState, editor, registerContentsList);
    }
  } else if (vimState.mode === Mode.Visual) {
    visualMode(vimState, editor, registerContentsList);
  } else {
    visualLineMode(vimState, editor, registerContentsList);
  }
}

function normalModeLinewise(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  const insertContentsList = registerContentsList.map(contents => {
    if (contents === undefined) return undefined;
    else return "\n" + contents;
  });

  const insertPositions = editor.selections.map(selection => {
    const lineLength = editor.document.lineAt(selection.active.line).text
      .length;
    return new vscode.Position(selection.active.line, lineLength);
  });

  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    insertContentsList
  );
  const rangeBeginnings = adjustedInsertPositions.map(
    position => new vscode.Position(position.line + 1, 0)
  );

  editor
    .edit(editBuilder => {
      insertPositions.forEach((position, i) => {
        const contents = insertContentsList[i];
        if (contents === undefined) return;

        editBuilder.insert(position, contents);
      });
    })
    .then(() => {
      editor.selections = rangeBeginnings.map(
        position => new vscode.Selection(position, position)
      );
    });

  vimState.lastPutRanges = {
    ranges: getInsertRangesFromBeginning(rangeBeginnings, registerContentsList),
    linewise: true
  };
}

function normalModeCharacterwise(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  const insertPositions = editor.selections.map(selection => {
    return positionUtils.right(editor.document, selection.active);
  });

  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    registerContentsList
  );
  const insertRanges = getInsertRangesFromBeginning(
    adjustedInsertPositions,
    registerContentsList
  );

  editor
    .edit(editBuilder => {
      insertPositions.forEach((insertPosition, i) => {
        const registerContents = registerContentsList[i];
        if (registerContents === undefined) return;

        editBuilder.insert(insertPosition, registerContents);
      });
    })
    .then(() => {
      editor.selections = editor.selections.map((selection, i) => {
        const range = insertRanges[i];
        if (range === undefined) return selection;

        const position = positionUtils.left(range.end);
        return new vscode.Selection(position, position);
      });
    });

  vimState.lastPutRanges = {
    ranges: insertRanges,
    linewise: false
  };
}

function visualMode(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  const insertContentsList = vimState.registers.linewise
    ? registerContentsList.map(contents => {
        if (!contents) return undefined;
        else return "\n" + contents + "\n";
      })
    : registerContentsList;

  editor
    .edit(editBuilder => {
      editor.selections.forEach((selection, i) => {
        const contents = insertContentsList[i];
        if (contents === undefined) return;

        editBuilder.delete(selection);
        editBuilder.insert(selection.start, contents);
      });
    })
    .then(() => {
      vimState.lastPutRanges = {
        ranges: getInsertRangesFromEnd(
          editor.document,
          editor.selections.map(selection => selection.active),
          insertContentsList
        ),
        linewise: vimState.registers.linewise
      };

      editor.selections = editor.selections.map(selection => {
        const newPosition = positionUtils.left(selection.active);
        return new vscode.Selection(newPosition, newPosition);
      });
    });

  enterNormalMode(vimState);
  setModeCursorStyle(vimState.mode, editor);
}

function visualLineMode(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  editor
    .edit(editBuilder => {
      editor.selections.forEach((selection, i) => {
        const registerContents = registerContentsList[i];
        if (registerContents === undefined) return;

        editBuilder.replace(selection, registerContents);
      });
    })
    .then(() => {
      vimState.lastPutRanges = {
        ranges: editor.selections.map(
          selection => new vscode.Range(selection.start, selection.end)
        ),
        linewise: vimState.registers.linewise
      };

      editor.selections = editor.selections.map(selection => {
        return new vscode.Selection(selection.start, selection.start);
      });

      enterNormalMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
    });
}
