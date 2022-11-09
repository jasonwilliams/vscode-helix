import * as vscode from "vscode";

enum MatchType {
  start = "start",
  end = "end",
}

interface BlockMatch {
  type: MatchType;
  match: RegExpMatchArray;
}

const startRegex = (startWords: string[]) =>
  RegExp(`(^|\\s)(${startWords.join("|")})($|\\s)`, "g");

const endRegex = (endWords: string[]) =>
  RegExp(`(^|\\s)(${endWords.join("|")})($|\\W)`, "g");

export function blockRange(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range {
  let startWords: string[] = [];
  let endWords: string[] = [];

  console.log(`LanguageID=${document.languageId}`);
  if (document.languageId === "elixir") {
    startWords = ["case", "cond", "fn", "def"];
    endWords = ["end"];
  } else {
    console.log(`Unsupported language: ${document.languageId}`);
    return new vscode.Range(position, position);
  }

  const start = findBlockStart(document, position, startWords, endWords);
  const end = findBlockEnd(document, position, startWords, endWords);

  if (start && end) {
    return new vscode.Range(start, end);
  }
  return new vscode.Range(position, position);
}

function findBlockStart(
  document: vscode.TextDocument,
  position: vscode.Position,
  startWords: string[],
  endWords: string[]
): vscode.Position | undefined {
  let closedBlocks: boolean[] = [];

  for (let i = position.line; i >= 0; --i) {
    let lineText =
      i === position.line
        ? document.lineAt(i).text.substr(position.character)
        : document.lineAt(i).text;

    let blockMatches: BlockMatch[] = [];
    for (const m of lineText.matchAll(startRegex(startWords))) {
      blockMatches.push({ type: MatchType.start, match: m });
    }

    for (const m of lineText.matchAll(endRegex(endWords))) {
      blockMatches.push({ type: MatchType.end, match: m });
    }

    blockMatches = blockMatches.sort((a, b) =>
      (a.match.index as number) > (b.match.index as number) ? 1 : -1
    );

    for (let idx = 0; idx < blockMatches.length; idx++) {
      const blockMatch = blockMatches[idx];
      if (blockMatch.type === MatchType.end) {
        closedBlocks.push(true);
      } else if (blockMatch.type === MatchType.start) {
        if (closedBlocks.length === 0) {
          const [fullText, , matchText] = blockMatch.match;
          const offset = fullText.indexOf(matchText);
          return new vscode.Position(
            i,
            (blockMatch.match.index as number) + offset
          );
        } else {
          closedBlocks.pop();
        }
      }
    }
  }
  return undefined;
}

function findBlockEnd(
  document: vscode.TextDocument,
  position: vscode.Position,
  startWords: string[],
  endWords: string[]
): vscode.Position | undefined {
  let openedBlocks: boolean[] = [true];

  for (let i = position.line; i < document.lineCount; ++i) {
    let lineText =
      i === position.line
        ? document.lineAt(i).text.substr(position.character)
        : document.lineAt(i).text;

    let blockMatches: BlockMatch[] = [];
    for (const m of lineText.matchAll(startRegex(startWords))) {
      blockMatches.push({ type: MatchType.start, match: m });
    }

    for (const m of lineText.matchAll(endRegex(endWords))) {
      blockMatches.push({ type: MatchType.end, match: m });
    }

    blockMatches = blockMatches.sort((a, b) =>
      (a.match.index as number) > (b.match.index as number) ? 1 : -1
    );

    for (let idx = 0; idx < blockMatches.length; idx++) {
      const blockMatch = blockMatches[idx];
      if (blockMatch.type === MatchType.start) {
        openedBlocks.push(true);
      } else if (blockMatch.type === MatchType.end) {
        openedBlocks.pop();
        if (openedBlocks.length === 0) {
          const [fullText, , matchText] = blockMatch.match;
          const offset = fullText.indexOf(matchText);
          return new vscode.Position(
            i,
            (blockMatch.match.index as number) + offset + matchText.length
          );
        }
      }
    }
  }
  return undefined;
}
