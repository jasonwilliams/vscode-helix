import * as vscode from 'vscode';

export function searchForward(
  document: vscode.TextDocument,
  needle: string,
  fromPosition: vscode.Position,
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

export function tillForward(document: vscode.TextDocument, needle: string, fromPosition: vscode.Position) {
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
  fromPosition: vscode.Position,
): vscode.Position | undefined {
  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : +Infinity;
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
  fromPosition: vscode.Position,
  offset?: number,
): vscode.Position | undefined {
  let n = offset ? offset - 1 : 0;

  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;

    for (let j = fromIndex; j < lineText.length; ++j) {
      // If closing and opening are the same, don't bother deducting n
      // However if they are different, we need to deduct n when we see an opening char
      if (lineText[j] === openingChar && openingChar !== closingChar) {
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
  fromPosition: vscode.Position,
  offset?: number,
): vscode.Position | undefined {
  let n = offset ? offset - 1 : 0;

  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : lineText.length - 1;

    for (let j = fromIndex; j >= 0; --j) {
      // If closing and opening are the same, don't bother deducting n
      // However if they are different, we need to deduct n when we see an opening char
      if (lineText[j] === closingChar && closingChar !== openingChar) {
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
