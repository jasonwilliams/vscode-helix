import * as vscode from "vscode";

import * as positionUtils from "../position_utils";
import { VimState } from "../vim_state_types";
import {
  getRegisterContentsList,
  adjustInsertPositions,
  getInsertRangesFromBeginning
} from "./common";

export function putBefore(vimState: VimState, editor: vscode.TextEditor) {
  const registerContentsList = getRegisterContentsList(vimState, editor);
  if (registerContentsList === undefined) return;

  if (vimState.registers.linewise) {
    normalModeLinewise(vimState, editor, registerContentsList);
  } else {
    normalModeCharacterwise(vimState, editor, registerContentsList);
  }
}

function normalModeLinewise(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  const insertContentsList = registerContentsList.map(contents => {
    if (contents === undefined) return undefined;
    else return contents + "\n";
  });

  const insertPositions = editor.selections.map(selection => {
    return new vscode.Position(selection.active.line, 0);
  });

  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    insertContentsList
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
      editor.selections = editor.selections.map((selection, i) => {
        const position = adjustedInsertPositions[i];
        if (position === undefined) return selection;

        return new vscode.Selection(position, position);
      });
    });

  vimState.lastPutRanges = {
    ranges: getInsertRangesFromBeginning(
      adjustedInsertPositions,
      registerContentsList
    ),
    linewise: true
  };
}

function normalModeCharacterwise(
  vimState: VimState,
  editor: vscode.TextEditor,
  registerContentsList: (string | undefined)[]
) {
  const insertPositions = editor.selections.map(selection => selection.active);
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
