import * as vscode from "vscode";

import { SimpleRange } from "./simple_range_types";

export function findQuoteRange(
  ranges: SimpleRange[],
  position: vscode.Position
): SimpleRange | undefined {
  const insideResult = ranges.find(
    x => x.start <= position.character && x.end >= position.character
  );

  if (insideResult) {
    return insideResult;
  }

  const outsideResult = ranges.find(x => x.start > position.character);

  if (outsideResult) {
    return outsideResult;
  }

  return undefined;
}

export function quoteRanges(quoteChar: string, s: string): SimpleRange[] {
  let stateInQuote = false;
  let stateStartIndex = 0;
  let backslashCount = 0;
  const ranges = [];

  for (let i = 0; i < s.length; ++i) {
    if (s[i] === quoteChar && backslashCount % 2 === 0) {
      if (stateInQuote) {
        ranges.push({
          start: stateStartIndex,
          end: i
        });

        stateInQuote = false;
      } else {
        stateInQuote = true;
        stateStartIndex = i;
      }
    }

    if (s[i] === "\\") {
      ++backslashCount;
    } else {
      backslashCount = 0;
    }
  }

  return ranges;
}
