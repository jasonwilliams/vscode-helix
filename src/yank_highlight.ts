import * as vscode from "vscode";

export function flashYankHighlight(
  editor: vscode.TextEditor,
  ranges: vscode.Range[]
) {
  const decoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: vscode.workspace
      .getConfiguration("simpleVim")
      .get("yankHighlightBackgroundColor")
  });

  editor.setDecorations(decoration, ranges);
  setTimeout(() => decoration.dispose(), 200);
}
