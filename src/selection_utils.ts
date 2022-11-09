import * as vscode from "vscode";

import * as positionUtils from "./position_utils";

export function vscodeToVimVisualSelection(
  document: vscode.TextDocument,
  vscodeSelection: vscode.Selection
): vscode.Selection {
  if (vscodeSelection.active.isBefore(vscodeSelection.anchor)) {
    return new vscode.Selection(
      positionUtils.left(vscodeSelection.anchor),
      vscodeSelection.active
    );
  } else {
    return new vscode.Selection(
      vscodeSelection.anchor,
      positionUtils.left(vscodeSelection.active)
    );
  }
}

export function vimToVscodeVisualSelection(
  document: vscode.TextDocument,
  vimSelection: vscode.Selection
): vscode.Selection {
  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode.Selection(
      positionUtils.right(document, vimSelection.anchor),
      vimSelection.active
    );
  } else {
    return new vscode.Selection(
      vimSelection.anchor,
      positionUtils.right(document, vimSelection.active)
    );
  }
}

export function vscodeToVimVisualLineSelection(
  document: vscode.TextDocument,
  vscodeSelection: vscode.Selection
): vscode.Selection {
  return new vscode.Selection(
    vscodeSelection.anchor.with({ character: 0 }),
    vscodeSelection.active.with({ character: 0 })
  );
}

export function vimToVscodeVisualLineSelection(
  document: vscode.TextDocument,
  vimSelection: vscode.Selection
): vscode.Selection {
  const anchorLineLength = document.lineAt(vimSelection.anchor.line).text
    .length;
  const activeLineLength = document.lineAt(vimSelection.active.line).text
    .length;

  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode.Selection(
      vimSelection.anchor.with({ character: anchorLineLength }),
      vimSelection.active.with({ character: 0 })
    );
  } else {
    return new vscode.Selection(
      vimSelection.anchor.with({ character: 0 }),
      vimSelection.active.with({ character: activeLineLength })
    );
  }
}
