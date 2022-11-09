import * as vscode from "vscode";

export function setVisualLineSelections(editor: vscode.TextEditor): void {
  editor.selections = editor.selections.map(selection => {
    if (!selection.isReversed || selection.isSingleLine) {
      const activeLineLength = editor.document.lineAt(selection.active.line)
        .text.length;
      return new vscode.Selection(
        selection.anchor.with({ character: 0 }),
        selection.active.with({ character: activeLineLength })
      );
    } else {
      const anchorLineLength = editor.document.lineAt(selection.anchor.line)
        .text.length;
      return new vscode.Selection(
        selection.anchor.with({ character: anchorLineLength }),
        selection.active.with({ character: 0 })
      );
    }
  });
}
