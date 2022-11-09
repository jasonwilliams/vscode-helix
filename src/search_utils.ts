import * as vscode from "vscode";

export function searchForward(
  document: vscode.TextDocument,
  needle: string,
  fromPosition: vscode.Position
): vscode.Position | undefined {
  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;
    const matchIndex = lineText.indexOf(needle, fromIndex);

    if (matchIndex >= 0) {
      return new vscode.Position(i, matchIndex);
    }
  }

  return undefined;
}

export function searchBackward(
  document: vscode.TextDocument,
  needle: string,
  fromPosition: vscode.Position
): vscode.Position | undefined {
  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex =
      i === fromPosition.line ? fromPosition.character : +Infinity;
    const matchIndex = lineText.lastIndexOf(needle, fromIndex);

    if (matchIndex >= 0) {
      return new vscode.Position(i, matchIndex);
    }
  }

  return undefined;
}

export function searchForwardBracket(
  document: vscode.TextDocument,
  openingChar: string,
  closingChar: string,
  fromPosition: vscode.Position
): vscode.Position | undefined {
  let n = 0;

  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;

    for (let j = fromIndex; j < lineText.length; ++j) {
      if (lineText[j] === openingChar) {
        ++n;
      } else if (lineText[j] === closingChar) {
        if (n === 0) {
          return new vscode.Position(i, j);
        } else {
          --n;
        }
      }
    }
  }

  return undefined;
}

export function searchBackwardBracket(
  document: vscode.TextDocument,
  openingChar: string,
  closingChar: string,
  fromPosition: vscode.Position
): vscode.Position | undefined {
  let n = 0;

  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex =
      i === fromPosition.line ? fromPosition.character : lineText.length - 1;

    for (let j = fromIndex; j >= 0; --j) {
      if (lineText[j] === closingChar) {
        ++n;
      } else if (lineText[j] === openingChar) {
        if (n === 0) {
          return new vscode.Position(i, j);
        } else {
          --n;
        }
      }
    }
  }

  return undefined;
}
