import * as vscode from "vscode";

import { VimState } from "../vim_state_types";

export function getRegisterContentsList(
  vimState: VimState,
  editor: vscode.TextEditor
) {
  if (vimState.registers.contentsList.length === 0) return undefined;

  let registerContentsList = vimState.registers.contentsList;

  // Handle putting with a different number of cursors than when you yanked
  if (vimState.registers.contentsList.length !== editor.selections.length) {
    const combinedContents = vimState.registers.contentsList.join("\n");
    registerContentsList = editor.selections.map(selection => combinedContents);
  }

  return registerContentsList;
}

// Given contents and positions at the end of the contents, return the position at the beginning of the contents
export function getInsertRangesFromEnd(
  document: vscode.TextDocument,
  positions: vscode.Position[],
  contentsList: (string | undefined)[]
) {
  return positions.map((position, i) => {
    const contents = contentsList[i];
    if (!contents) return undefined;

    const lines = contents.split(/\r?\n/);

    let beginningPosition;
    if (lines.length > 1) {
      const beginningLine = position.line - (lines.length - 1);
      const beginningCharacter =
        document.lineAt(beginningLine).text.length - lines[0].length;
      beginningPosition = new vscode.Position(
        beginningLine,
        beginningCharacter
      );
    } else {
      beginningPosition = position.with({
        character: position.character - lines[0].length
      });
    }

    return new vscode.Range(beginningPosition, position);
  });
}

// Given positions and contents inserted at those positions, return the range that will
// select that contents
export function getInsertRangesFromBeginning(
  positions: vscode.Position[],
  contentsList: (string | undefined)[]
) {
  return positions.map((position, i) => {
    const contents = contentsList[i];
    if (!contents) return undefined;

    const lines = contents.split(/\r?\n/);
    const endLine = position.line + lines.length - 1;
    const endCharacter =
      lines.length === 1
        ? position.character + lines[0].length
        : lines[lines.length - 1].length;

    return new vscode.Range(
      position,
      new vscode.Position(endLine, endCharacter)
    );
  });
}

// Given positions and contents inserted at those positions, figure out how the positions will move
// when the contents is inserted. For example inserting a line above a position will increase its
// line number by one.
export function adjustInsertPositions(
  positions: vscode.Position[],
  contentsList: (string | undefined)[]
) {
  const indexPositions = positions.map((position, i) => ({
    originalIndex: i,
    position: position
  }));

  indexPositions.sort((a, b) => {
    if (a.position.isBefore(b.position)) return -1;
    else if (a.position.isEqual(b.position)) return 0;
    else return 1;
  });

  const adjustedIndexPositions = [];
  let lineOffset = 0;
  let characterOffset = 0;
  let lineNumber = 0;

  for (const indexPosition of indexPositions) {
    // Adjust position

    const adjustedLine = indexPosition.position.line + lineOffset;

    let adjustedCharacter = indexPosition.position.character;
    if (indexPosition.position.line === lineNumber) {
      adjustedCharacter += characterOffset;
    }

    adjustedIndexPositions.push({
      originalIndex: indexPosition.originalIndex,
      position: new vscode.Position(adjustedLine, adjustedCharacter)
    });

    // Increase offsets

    const contents = contentsList[indexPosition.originalIndex];

    if (contents !== undefined) {
      const contentsLines = contents.split(/\r?\n/);

      lineOffset += contentsLines.length - 1;

      if (indexPosition.position.line === lineNumber) {
        if (contentsLines.length === 1) {
          characterOffset += contentsLines[0].length;
        } else {
          characterOffset +=
            contentsLines[contentsLines.length - 1].length -
            indexPosition.position.character;
        }
      } else {
        characterOffset = 0;
        lineNumber = indexPosition.position.line;
      }
    }
  }

  adjustedIndexPositions.sort((a, b) => a.originalIndex - b.originalIndex);
  return adjustedIndexPositions.map(indexPosition => indexPosition.position);
}
