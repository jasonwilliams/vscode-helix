import * as vscode from 'vscode';
import { Range } from 'vscode';
import { SimpleRange } from './simple_range_types';

export function paragraphForward(document: vscode.TextDocument, line: number): number {
  let visitedNonEmptyLine = false;

  for (let i = line; i < document.lineCount; ++i) {
    if (visitedNonEmptyLine) {
      if (document.lineAt(i).isEmptyOrWhitespace) {
        return i;
      }
    } else {
      if (!document.lineAt(i).isEmptyOrWhitespace) {
        visitedNonEmptyLine = true;
      }
    }
  }

  return document.lineCount - 1;
}

export function paragraphBackward(document: vscode.TextDocument, line: number): number {
  let visitedNonEmptyLine = false;

  for (let i = line; i >= 0; --i) {
    if (visitedNonEmptyLine) {
      if (document.lineAt(i).isEmptyOrWhitespace) {
        return i;
      }
    } else {
      if (!document.lineAt(i).isEmptyOrWhitespace) {
        visitedNonEmptyLine = true;
      }
    }
  }

  return 0;
}

export function paragraphRangeOuter(document: vscode.TextDocument, line: number): SimpleRange | undefined {
  if (document.lineAt(line).isEmptyOrWhitespace) return undefined;

  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardOuter(document, line + 1),
  };
}

function paragraphRangeForwardOuter(document: vscode.TextDocument, line: number): number {
  let seenWhitespace = false;

  for (let i = line; i < document.lineCount; ++i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      seenWhitespace = true;
    } else if (seenWhitespace) {
      return i - 1;
    }
  }

  return document.lineCount - 1;
}

function paragraphRangeBackward(document: vscode.TextDocument, line: number): number {
  for (let i = line; i >= 0; --i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i + 1;
    }
  }

  return 0;
}

export function paragraphRangeInner(document: vscode.TextDocument, line: number): SimpleRange | undefined {
  if (document.lineAt(line).isEmptyOrWhitespace) return undefined;

  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardInner(document, line + 1),
  };
}

function paragraphRangeForwardInner(document: vscode.TextDocument, line: number): number {
  for (let i = line; i < document.lineCount; ++i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i - 1;
    }
  }

  return document.lineCount - 1;
}

export function selectNextParagraph(editor: vscode.TextEditor): Range | undefined {
  const document = editor.document;
  const line = editor.selection.active.line;
  let paragraphStart: number | undefined = undefined;

  const runDownUntilNonWhitespace = (line: number): number => {
    for (let i = line; i < document.lineCount; i++) {
      if (!document.lineAt(i).isEmptyOrWhitespace) {
        return i;
      }
    }
    return document.lineCount - 1;
  };

  // First run down until the next non-empty line (if we're already on a paragraph)
  if (!document.lineAt(line).isEmptyOrWhitespace) {
    for (let i = line; i < document.lineCount; i++) {
      if (document.lineAt(i).isEmptyOrWhitespace) {
        paragraphStart = runDownUntilNonWhitespace(i);
        break;
      }
    }
  } else {
    // If we're not on a paragraph or text then run until we find a non-empty line;
    paragraphStart = runDownUntilNonWhitespace(line);
  }

  if (!paragraphStart) {
    return;
  }

  const paragraphEnd = paragraphForward(document, paragraphStart);
  return new vscode.Range(document.lineAt(paragraphStart).range.start, document.lineAt(paragraphEnd).range.end);
}

export function selectPreviousParagraph(editor: vscode.TextEditor): Range | undefined {
  const document = editor.document;
  const line = editor.selection.active.line - 1;
  let paragraphStart: number | undefined = undefined;

  const runUpUntilNonWhitespace = (line: number): number => {
    for (let i = line; i > 0; --i) {
      if (!document.lineAt(i).isEmptyOrWhitespace) {
        return i + 1;
      }
    }
    return 0;
  };

  // First up down until the next non-empty line (if we're already on a paragraph)
  if (!document.lineAt(line).isEmptyOrWhitespace) {
    for (let i = line; i > 0; i--) {
      if (document.lineAt(i).isEmptyOrWhitespace) {
        paragraphStart = runUpUntilNonWhitespace(i);
        break;
      }
    }
  } else {
    // If we're not on a paragraph or text then run until we find a non-empty line;
    paragraphStart = runUpUntilNonWhitespace(line);
  }

  if (!paragraphStart) {
    return;
  }

  const paragraphEnd = paragraphBackward(document, paragraphStart) + 1;
  return new vscode.Range(document.lineAt(paragraphEnd).range.start, document.lineAt(paragraphStart).range.start);
}
