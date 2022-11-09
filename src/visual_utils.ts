import * as vscode from "vscode";

import * as positionUtils from "./position_utils";

// This fixes the selection anchor when selection is changed so that active and anchor are reversed.
// For most motions we use execMotion for perfect visual mode emulation, but for some we need to
// use VSCode's cursorMove instead and this function allows us to fix the selection after the fact.
export function setVisualSelections(
  editor: vscode.TextEditor,
  originalSelections: vscode.Selection[]
): void {
  editor.selections = editor.selections.map((selection, i) => {
    const originalSelection = originalSelections[i];

    let activePosition = selection.active;
    if (!selection.isReversed && selection.active.character === 0) {
      activePosition = positionUtils.right(editor.document, selection.active);
    }

    if (
      originalSelection.active.isBefore(originalSelection.anchor) &&
      selection.active.isAfterOrEqual(selection.anchor)
    ) {
      return new vscode.Selection(
        positionUtils.left(selection.anchor),
        activePosition
      );
    } else if (
      originalSelection.active.isAfter(originalSelection.anchor) &&
      selection.active.isBeforeOrEqual(selection.anchor)
    ) {
      return new vscode.Selection(
        positionUtils.right(editor.document, selection.anchor),
        activePosition
      );
    } else {
      return new vscode.Selection(selection.anchor, activePosition);
    }
  });
}
