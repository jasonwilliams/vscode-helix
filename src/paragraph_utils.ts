import * as vscode from "vscode";
import { SimpleRange } from "./simple_range_types";

export function paragraphForward(
  document: vscode.TextDocument,
  line: number
): number {
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

export function paragraphBackward(
  document: vscode.TextDocument,
  line: number
): number {
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

export function paragraphRangeOuter(
  document: vscode.TextDocument,
  line: number
): SimpleRange | undefined {
  if (document.lineAt(line).isEmptyOrWhitespace) return undefined;

  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardOuter(document, line + 1)
  };
}

function paragraphRangeForwardOuter(
  document: vscode.TextDocument,
  line: number
): number {
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

function paragraphRangeBackward(
  document: vscode.TextDocument,
  line: number
): number {
  for (let i = line; i >= 0; --i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i + 1;
    }
  }

  return 0;
}

export function paragraphRangeInner(
  document: vscode.TextDocument,
  line: number
): SimpleRange | undefined {
  if (document.lineAt(line).isEmptyOrWhitespace) return undefined;

  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardInner(document, line + 1)
  };
}

function paragraphRangeForwardInner(
  document: vscode.TextDocument,
  line: number
): number {
  for (let i = line; i < document.lineCount; ++i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i - 1;
    }
  }

  return document.lineCount - 1;
}
