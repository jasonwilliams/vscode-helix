import * as vscode from 'vscode';

import * as positionUtils from './position_utils';

export function vscodeToVimVisualSelection(
  document: vscode.TextDocument,
  vscodeSelection: vscode.Selection,
): vscode.Selection {
  if (vscodeSelection.active.isBefore(vscodeSelection.anchor)) {
    return new vscode.Selection(vscodeSelection.anchor, vscodeSelection.active);
  } else {
    return new vscode.Selection(vscodeSelection.anchor, positionUtils.left(vscodeSelection.active));
  }
}

export function vimToVscodeVisualSelection(
  document: vscode.TextDocument,
  vimSelection: vscode.Selection,
): vscode.Selection {
  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode.Selection(vimSelection.anchor, vimSelection.active);
  } else {
    const lineLength = document.lineAt(vimSelection.active.line).text.length;
    if (vimSelection.active.character >= lineLength && vimSelection.active.line < document.lineCount - 1) {
      return new vscode.Selection(vimSelection.anchor, new vscode.Position(vimSelection.active.line + 1, 0));
    }
    return new vscode.Selection(vimSelection.anchor, positionUtils.right(document, vimSelection.active));
  }
}

export function vscodeToVimVisualLineSelection(
  document: vscode.TextDocument,
  vscodeSelection: vscode.Selection,
): vscode.Selection {
  return new vscode.Selection(
    vscodeSelection.anchor.with({ character: 0 }),
    vscodeSelection.active.with({ character: 0 }),
  );
}

export function vimToVscodeVisualLineSelection(
  document: vscode.TextDocument,
  vimSelection: vscode.Selection,
): vscode.Selection {
  const anchorLineLength = document.lineAt(vimSelection.anchor.line).text.length;
  const activeLineLength = document.lineAt(vimSelection.active.line).text.length;

  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode.Selection(
      vimSelection.anchor.with({ character: anchorLineLength }),
      vimSelection.active.with({ character: 0 }),
    );
  } else {
    return new vscode.Selection(
      vimSelection.anchor.with({ character: 0 }),
      vimSelection.active.with({ character: activeLineLength }),
    );
  }
}

export function flipSelection(editor: vscode.TextEditor | undefined) {
  if (!editor) {
    return;
  }

  editor.selections = editor.selections.map((s) => new vscode.Selection(s.active, s.anchor));
  // When flipping selection the new active position may be off screen, so reveal line to the active location
  vscode.commands.executeCommand('revealLine', {
    lineNumber: editor.selection.active.line,
    at: 'center',
  });
}
