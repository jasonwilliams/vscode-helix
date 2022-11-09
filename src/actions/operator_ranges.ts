import * as vscode from "vscode";

import {
  createOperatorRangeExactKeys,
  createOperatorRangeRegex,
} from "../parse_keys";
import { OperatorRange } from "../parse_keys_types";
import {
  searchForward,
  searchBackward,
  searchBackwardBracket,
  searchForwardBracket,
} from "../search_utils";
import * as positionUtils from "../position_utils";
import { wordRanges, whitespaceWordRanges } from "../word_utils";
import {
  paragraphForward,
  paragraphBackward,
  paragraphRangeOuter,
  paragraphRangeInner,
} from "../paragraph_utils";
import { VimState } from "../vim_state_types";
import { quoteRanges, findQuoteRange } from "../quote_utils";
import { indentLevelRange } from "../indent_utils";
import { blockRange } from "../block_utils";
import { getTags } from "../tag_utils";
import { arrayFindLast } from "../array_utils";
// import KeyMap from "./keymap";

export const operatorRanges: OperatorRange[] = [
  // createOperatorRangeExactKeys(
  //   [KeyMap.Motions.MoveRight],
  //   false,
  //   (vimState, document, position) => {
  //     const right = positionUtils.right(document, position);

  //     if (right.isEqual(position)) {
  //       return undefined;
  //     } else {
  //       return new vscode.Range(position, right);
  //     }
  //   }
  // ),
  // createOperatorRangeExactKeys(
  //   [KeyMap.Motions.MoveLeft],
  //   false,
  //   (vimState, document, position) => {
  //     const left = positionUtils.left(position);

  //     if (left.isEqual(position)) {
  //       return undefined;
  //     } else {
  //       return new vscode.Range(position, left);
  //     }
  //   }
  // ),
  // createOperatorRangeExactKeys(
  //   [KeyMap.Motions.MoveUp],
  //   true,
  //   (vimState, document, position) => {
  //     if (position.line === 0) {
  //       return new vscode.Range(
  //         new vscode.Position(0, 0),
  //         positionUtils.lineEnd(document, position)
  //       );
  //     } else {
  //       return new vscode.Range(
  //         new vscode.Position(position.line - 1, 0),
  //         positionUtils.lineEnd(document, position)
  //       );
  //     }
  //   }
  // ),

  // createOperatorRangeExactKeys(
  //   [KeyMap.Motions.MoveDown],
  //   true,
  //   (vimState, document, position) => {
  //     if (position.line === document.lineCount - 1) {
  //       return new vscode.Range(
  //         new vscode.Position(position.line, 0),
  //         positionUtils.lineEnd(document, position)
  //       );
  //     } else {
  //       return new vscode.Range(
  //         new vscode.Position(position.line, 0),
  //         positionUtils.lineEnd(
  //           document,
  //           position.with({ line: position.line + 1 })
  //         )
  //       );
  //     }
  //   }
  // ),

  createOperatorRangeExactKeys(
    ["w"],
    false,
    createWordForwardHandler(wordRanges)
  ),
  createOperatorRangeExactKeys(
    ["W"],
    false,
    createWordForwardHandler(whitespaceWordRanges)
  ),

  createOperatorRangeExactKeys(
    ["b"],
    false,
    createWordBackwardHandler(wordRanges)
  ),
  createOperatorRangeExactKeys(
    ["B"],
    false,
    createWordBackwardHandler(whitespaceWordRanges)
  ),

  createOperatorRangeExactKeys(["e"], false, createWordEndHandler(wordRanges)),
  createOperatorRangeExactKeys(
    ["E"],
    false,
    createWordEndHandler(whitespaceWordRanges)
  ),

  createOperatorRangeExactKeys(
    ["i", "w"],
    false,
    createInnerWordHandler(wordRanges)
  ),
  createOperatorRangeExactKeys(
    ["i", "W"],
    false,
    createInnerWordHandler(whitespaceWordRanges)
  ),

  createOperatorRangeExactKeys(
    ["a", "w"],
    false,
    createOuterWordHandler(wordRanges)
  ),
  createOperatorRangeExactKeys(
    ["a", "W"],
    false,
    createOuterWordHandler(whitespaceWordRanges)
  ),

  createOperatorRangeRegex(
    /^f(..)$/,
    /^(f|f.)$/,
    false,
    (vimState, document, position, match) => {
      const fromPosition = position.with({ character: position.character + 1 });
      const result = searchForward(document, match[1], fromPosition);

      if (result) {
        return new vscode.Range(position, result);
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeRegex(
    /^F(..)$/,
    /^(F|F.)$/,
    false,
    (vimState, document, position, match) => {
      const fromPosition = position.with({ character: position.character - 1 });
      const result = searchBackward(document, match[1], fromPosition);

      if (result) {
        return new vscode.Range(position, result);
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeRegex(
    /^t(.)$/,
    /^t$/,
    false,
    (vimState, document, position, match) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.indexOf(match[1], position.character + 1);

      if (result >= 0) {
        return new vscode.Range(position, position.with({ character: result }));
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeRegex(
    /^T(.)$/,
    /^T$/,
    false,
    (vimState, document, position, match) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.lastIndexOf(match[1], position.character - 1);

      if (result >= 0) {
        const newPosition = positionUtils.right(
          document,
          position.with({ character: result })
        );
        return new vscode.Range(newPosition, position);
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeExactKeys(
    ["g", "g"],
    true,
    (vimState, document, position) => {
      const lineLength = document.lineAt(position.line).text.length;

      return new vscode.Range(
        new vscode.Position(0, 0),
        position.with({ character: lineLength })
      );
    }
  ),

  createOperatorRangeExactKeys(["G"], true, (vimState, document, position) => {
    const lineLength = document.lineAt(document.lineCount - 1).text.length;

    return new vscode.Range(
      position.with({ character: 0 }),
      new vscode.Position(document.lineCount - 1, lineLength)
    );
  }),

  // TODO: return undefined?
  createOperatorRangeExactKeys(["}"], true, (vimState, document, position) => {
    return new vscode.Range(
      position.with({ character: 0 }),
      new vscode.Position(paragraphForward(document, position.line), 0)
    );
  }),

  // TODO: return undefined?
  createOperatorRangeExactKeys(["{"], true, (vimState, document, position) => {
    return new vscode.Range(
      new vscode.Position(paragraphBackward(document, position.line), 0),
      position.with({ character: 0 })
    );
  }),

  createOperatorRangeExactKeys(
    ["i", "p"],
    true,
    (vimState, document, position) => {
      const result = paragraphRangeInner(document, position.line);

      if (result) {
        return new vscode.Range(
          new vscode.Position(result.start, 0),
          new vscode.Position(
            result.end,
            document.lineAt(result.end).text.length
          )
        );
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeExactKeys(
    ["a", "p"],
    true,
    (vimState, document, position) => {
      const result = paragraphRangeOuter(document, position.line);

      if (result) {
        return new vscode.Range(
          new vscode.Position(result.start, 0),
          new vscode.Position(
            result.end,
            document.lineAt(result.end).text.length
          )
        );
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeExactKeys(["i", "'"], false, createInnerQuoteHandler("'")),
  createOperatorRangeExactKeys(["a", "'"], false, createOuterQuoteHandler("'")),

  createOperatorRangeExactKeys(["i", '"'], false, createInnerQuoteHandler('"')),
  createOperatorRangeExactKeys(["a", '"'], false, createOuterQuoteHandler('"')),

  createOperatorRangeExactKeys(["i", "`"], false, createInnerQuoteHandler("`")),
  createOperatorRangeExactKeys(["a", "`"], false, createOuterQuoteHandler("`")),

  createOperatorRangeExactKeys(
    ["i", "("],
    false,
    createInnerBracketHandler("(", ")")
  ),
  createOperatorRangeExactKeys(
    ["a", "("],
    false,
    createOuterBracketHandler("(", ")")
  ),

  createOperatorRangeExactKeys(
    ["i", "{"],
    false,
    createInnerBracketHandler("{", "}")
  ),
  createOperatorRangeExactKeys(
    ["a", "{"],
    false,
    createOuterBracketHandler("{", "}")
  ),

  createOperatorRangeExactKeys(
    ["i", "["],
    false,
    createInnerBracketHandler("[", "]")
  ),
  createOperatorRangeExactKeys(
    ["a", "["],
    false,
    createOuterBracketHandler("[", "]")
  ),

  createOperatorRangeExactKeys(
    ["i", "<"],
    false,
    createInnerBracketHandler("<", ">")
  ),
  createOperatorRangeExactKeys(
    ["a", "<"],
    false,
    createOuterBracketHandler("<", ">")
  ),

  createOperatorRangeExactKeys(
    ["i", "t"],
    false,
    (vimState, document, position) => {
      const tags = getTags(document);

      const closestTag = arrayFindLast(tags, (tag) => {
        if (tag.closing) {
          return (
            position.isAfterOrEqual(tag.opening.start) &&
            position.isBeforeOrEqual(tag.closing.end)
          );
        } else {
          // Self-closing tags have no inside
          return false;
        }
      });

      if (closestTag) {
        if (closestTag.closing) {
          return new vscode.Range(
            closestTag.opening.end.with({
              character: closestTag.opening.end.character + 1,
            }),
            closestTag.closing.start
          );
        } else {
          throw new Error(
            "We should have already filtered out self-closing tags above"
          );
        }
      } else {
        return undefined;
      }
    }
  ),

  createOperatorRangeExactKeys(
    ["a", "t"],
    false,
    (vimState, document, position) => {
      const tags = getTags(document);

      const closestTag = arrayFindLast(tags, (tag) => {
        const afterStart = position.isAfterOrEqual(tag.opening.start);

        if (tag.closing) {
          return afterStart && position.isBeforeOrEqual(tag.closing.end);
        } else {
          return afterStart && position.isBeforeOrEqual(tag.opening.end);
        }
      });

      if (closestTag) {
        if (closestTag.closing) {
          return new vscode.Range(
            closestTag.opening.start,
            closestTag.closing.end.with({
              character: closestTag.closing.end.character + 1,
            })
          );
        } else {
          return new vscode.Range(
            closestTag.opening.start,
            closestTag.opening.end.with({
              character: closestTag.opening.end.character + 1,
            })
          );
        }
      } else {
        return undefined;
      }
    }
  ),

  // TODO: return undefined?
  createOperatorRangeExactKeys(
    ["i", "i"],
    true,
    (vimState, document, position) => {
      const simpleRange = indentLevelRange(document, position.line);

      return new vscode.Range(
        new vscode.Position(simpleRange.start, 0),
        new vscode.Position(
          simpleRange.end,
          document.lineAt(simpleRange.end).text.length
        )
      );
    }
  ),

  createOperatorRangeExactKeys(
    ["a", "b"],
    true,
    (vimState, document, position) => {
      const range = blockRange(document, position);

      return range;
    }
  ),
];

function createInnerBracketHandler(
  openingChar: string,
  closingChar: string
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const bracketRange = getBracketRange(
      document,
      position,
      openingChar,
      closingChar
    );

    if (bracketRange) {
      return new vscode.Range(
        bracketRange.start.with({
          character: bracketRange.start.character + 1,
        }),
        bracketRange.end
      );
    } else {
      return undefined;
    }
  };
}

function createOuterBracketHandler(
  openingChar: string,
  closingChar: string
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const bracketRange = getBracketRange(
      document,
      position,
      openingChar,
      closingChar
    );

    if (bracketRange) {
      return new vscode.Range(
        bracketRange.start,
        bracketRange.end.with({ character: bracketRange.end.character + 1 })
      );
    } else {
      return undefined;
    }
  };
}

function getBracketRange(
  document: vscode.TextDocument,
  position: vscode.Position,
  openingChar: string,
  closingChar: string
): vscode.Range | undefined {
  const lineText = document.lineAt(position.line).text;
  const currentChar = lineText[position.character];

  let start;
  let end;
  if (currentChar === openingChar) {
    start = position;
    end = searchForwardBracket(
      document,
      openingChar,
      closingChar,
      positionUtils.rightWrap(document, position)
    );
  } else if (currentChar === closingChar) {
    start = searchBackwardBracket(
      document,
      openingChar,
      closingChar,
      positionUtils.leftWrap(document, position)
    );
    end = position;
  } else {
    start = searchBackwardBracket(document, openingChar, closingChar, position);
    end = searchForwardBracket(document, openingChar, closingChar, position);
  }

  if (start && end) {
    return new vscode.Range(start, end);
  } else {
    return undefined;
  }
}

function createInnerQuoteHandler(
  quoteChar: string
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = quoteRanges(quoteChar, lineText);
    const result = findQuoteRange(ranges, position);

    if (result) {
      return new vscode.Range(
        position.with({ character: result.start + 1 }),
        position.with({ character: result.end })
      );
    } else {
      return undefined;
    }
  };
}

function createOuterQuoteHandler(
  quoteChar: string
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = quoteRanges(quoteChar, lineText);
    const result = findQuoteRange(ranges, position);

    if (result) {
      return new vscode.Range(
        position.with({ character: result.start }),
        position.with({ character: result.end + 1 })
      );
    } else {
      return undefined;
    }
  };
}

function createWordForwardHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);

    const result = ranges.find((x) => x.start > position.character);

    if (result) {
      return new vscode.Range(
        position,
        position.with({ character: result.start })
      );
    } else {
      return new vscode.Range(
        position,
        position.with({ character: lineText.length })
      );
    }
  };
}

function createWordBackwardHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);

    const result = ranges.reverse().find((x) => x.start < position.character);

    if (result) {
      return new vscode.Range(
        position.with({ character: result.start }),
        position
      );
    } else {
      return undefined;
    }
  };
}

function createWordEndHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);

    const result = ranges.find((x) => x.end > position.character);

    if (result) {
      return new vscode.Range(
        position,
        positionUtils.right(document, position.with({ character: result.end }))
      );
    } else {
      return undefined;
    }
  };
}

function createInnerWordHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);

    const result = ranges.find(
      (x) => x.start <= position.character && position.character <= x.end
    );

    if (result) {
      return new vscode.Range(
        position.with({ character: result.start }),
        positionUtils.right(document, position.with({ character: result.end }))
      );
    } else {
      return undefined;
    }
  };
}

function createOuterWordHandler(
  wordRangesFunction: (text: string) => { start: number; end: number }[]
): (
  vimState: VimState,
  document: vscode.TextDocument,
  position: vscode.Position
) => vscode.Range | undefined {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);

    for (let i = 0; i < ranges.length; ++i) {
      const range = ranges[i];

      if (
        range.start <= position.character &&
        position.character <= range.end
      ) {
        if (i < ranges.length - 1) {
          return new vscode.Range(
            position.with({ character: range.start }),
            position.with({ character: ranges[i + 1].start })
          );
        } else if (i > 0) {
          return new vscode.Range(
            positionUtils.right(
              document,
              position.with({ character: ranges[i - 1].end })
            ),
            positionUtils.right(
              document,
              position.with({ character: range.end })
            )
          );
        } else {
          return new vscode.Range(
            position.with({ character: range.start }),
            positionUtils.right(
              document,
              position.with({ character: range.end })
            )
          );
        }
      }
    }

    return undefined;
  };
}
