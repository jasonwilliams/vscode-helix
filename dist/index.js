"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(src_exports);
var vscode21 = __toESM(require("vscode"));

// src/scroll_commands.ts
var vscode = __toESM(require("vscode"));
function editorScroll(to, by) {
  vscode.commands.executeCommand("editorScroll", {
    to,
    by
  });
}
function scrollDownHalfPage() {
  editorScroll("down", "halfPage");
}
function scrollUpHalfPage() {
  editorScroll("up", "halfPage");
}
function scrollDownPage() {
  editorScroll("down", "page");
}
function scrollUpPage() {
  editorScroll("up", "page");
}

// src/modes.ts
var vscode2 = __toESM(require("vscode"));
function enterInsertMode(vimState) {
  vimState.mode = 0 /* Insert */;
  setModeContext("extension.simpleVim.insertMode");
}
function enterNormalMode(vimState) {
  vimState.mode = 1 /* Normal */;
  setModeContext("extension.simpleVim.normalMode");
}
function enterVisualMode(vimState) {
  vimState.mode = 2 /* Visual */;
  setModeContext("extension.simpleVim.visualMode");
}
function enterVisualLineMode(vimState) {
  vimState.mode = 3 /* VisualLine */;
  setModeContext("extension.simpleVim.visualLineMode");
}
function enterOccurrenceMode(vimState) {
  vimState.mode = 4 /* Occurrence */;
  setModeContext("extension.simpleVim.occurrenceMode");
}
function setModeContext(key) {
  const modeKeys = [
    "extension.simpleVim.insertMode",
    "extension.simpleVim.normalMode",
    "extension.simpleVim.visualMode",
    "extension.simpleVim.visualLineMode",
    "extension.simpleVim.occurrenceMode"
  ];
  modeKeys.forEach((modeKey) => {
    vscode2.commands.executeCommand("setContext", modeKey, key === modeKey);
  });
}
function setModeCursorStyle(mode, editor) {
  if (mode === 0 /* Insert */ || mode === 4 /* Occurrence */) {
    editor.options.cursorStyle = vscode2.TextEditorCursorStyle.Line;
  } else if (mode === 1 /* Normal */) {
    editor.options.cursorStyle = vscode2.TextEditorCursorStyle.Block;
  } else if (mode === 2 /* Visual */ || mode === 3 /* VisualLine */) {
    editor.options.cursorStyle = vscode2.TextEditorCursorStyle.Block;
  }
}

// src/type_handler.ts
var vscode19 = __toESM(require("vscode"));

// src/actions/actions.ts
var vscode15 = __toESM(require("vscode"));

// src/parse_keys.ts
function arrayStartsWith(prefix, xs) {
  if (xs.length < prefix.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; ++i) {
    if (prefix[i] !== xs[i]) {
      return false;
    }
  }
  return true;
}
function arrayEquals(xs, ys) {
  if (xs.length !== ys.length) {
    return false;
  }
  for (let i = 0; i < xs.length; ++i) {
    if (xs[i] !== ys[i]) {
      return false;
    }
  }
  return true;
}
function parseKeysExact(matchKeys, modes, action) {
  return (vimState, keys, editor) => {
    if (modes && modes.indexOf(vimState.mode) < 0) {
      return 1 /* NO */;
    }
    if (arrayEquals(keys, matchKeys)) {
      action(vimState, editor);
      return 0 /* YES */;
    } else if (arrayStartsWith(keys, matchKeys)) {
      return 2 /* MORE_INPUT */;
    } else {
      return 1 /* NO */;
    }
  };
}
function parseKeysRegex(doesPattern, couldPattern, modes, action) {
  return (vimState, keys, editor) => {
    if (modes && modes.indexOf(vimState.mode) < 0) {
      return 1 /* NO */;
    }
    const keysStr = keys.join("");
    const doesMatch = keysStr.match(doesPattern);
    if (doesMatch) {
      action(vimState, editor, doesMatch);
      return 0 /* YES */;
    } else if (keysStr.match(couldPattern)) {
      return 2 /* MORE_INPUT */;
    } else {
      return 1 /* NO */;
    }
  };
}
function parseOperatorPart(keys, operatorKeys) {
  if (arrayStartsWith(operatorKeys, keys)) {
    return {
      kind: "success",
      rest: keys.slice(operatorKeys.length)
    };
  } else if (arrayStartsWith(keys, operatorKeys)) {
    return {
      kind: "failure",
      status: 2 /* MORE_INPUT */
    };
  } else {
    return {
      kind: "failure",
      status: 1 /* NO */
    };
  }
}
function parseOperatorRangePart(vimState, keys, editor, motions2) {
  let could = false;
  for (const motion of motions2) {
    const result = motion(vimState, keys, editor);
    if (result.kind === "success") {
      return result;
    } else if (result.status === 2 /* MORE_INPUT */) {
      could = true;
    }
  }
  if (could) {
    return {
      kind: "failure",
      status: 2 /* MORE_INPUT */
    };
  } else {
    return {
      kind: "failure",
      status: 1 /* NO */
    };
  }
}
function parseKeysOperator(operatorKeys, motions2, operator) {
  return (vimState, keys, editor) => {
    const operatorResult = parseOperatorPart(keys, operatorKeys);
    if (operatorResult.kind === "failure") {
      return operatorResult.status;
    }
    let ranges;
    let linewise = true;
    if (vimState.mode === 1 /* Normal */) {
      if (operatorResult.rest.length === 0) {
        return 2 /* MORE_INPUT */;
      }
      const motionResult = parseOperatorRangePart(
        vimState,
        operatorResult.rest,
        editor,
        motions2
      );
      if (motionResult.kind === "failure") {
        return motionResult.status;
      }
      ranges = motionResult.ranges;
      linewise = motionResult.linewise;
    } else if (vimState.mode === 3 /* VisualLine */) {
      ranges = editor.selections;
      linewise = true;
    } else {
      ranges = editor.selections;
      linewise = false;
    }
    operator(vimState, editor, ranges, linewise);
    return 0 /* YES */;
  };
}
function createOperatorRangeExactKeys(matchKeys, linewise, f) {
  return (vimState, keys, editor) => {
    if (arrayEquals(keys, matchKeys)) {
      const ranges = editor.selections.map((selection) => {
        return f(vimState, editor.document, selection.active);
      });
      return {
        kind: "success",
        ranges,
        linewise
      };
    } else if (arrayStartsWith(keys, matchKeys)) {
      return {
        kind: "failure",
        status: 2 /* MORE_INPUT */
      };
    } else {
      return {
        kind: "failure",
        status: 1 /* NO */
      };
    }
  };
}
function createOperatorRangeRegex(doesPattern, couldPattern, linewise, f) {
  return (vimState, keys, editor) => {
    const keysStr = keys.join("");
    const doesMatch = keysStr.match(doesPattern);
    if (doesMatch) {
      const ranges = editor.selections.map((selection) => {
        return f(vimState, editor.document, selection.active, doesMatch);
      });
      return {
        kind: "success",
        ranges,
        linewise
      };
    } else if (keysStr.match(couldPattern)) {
      return {
        kind: "failure",
        status: 2 /* MORE_INPUT */
      };
    } else {
      return {
        kind: "failure",
        status: 1 /* NO */
      };
    }
  };
}

// src/position_utils.ts
var vscode3 = __toESM(require("vscode"));
function left(position, count = 1) {
  return position.with({
    character: Math.max(position.character - count, 0)
  });
}
function right(document, position, count = 1) {
  const lineLength = document.lineAt(position.line).text.length;
  return position.with({
    character: Math.min(position.character + count, lineLength)
  });
}
function rightNormal(document, position, count = 1) {
  const lineLength = document.lineAt(position.line).text.length;
  if (lineLength === 0) {
    return position.with({ character: 0 });
  } else {
    return position.with({
      character: Math.min(position.character + count, lineLength - 1)
    });
  }
}
function leftWrap(document, position) {
  if (position.character <= 0) {
    if (position.line <= 0) {
      return position;
    } else {
      const previousLineLength = document.lineAt(position.line - 1).text.length;
      return new vscode3.Position(position.line - 1, previousLineLength);
    }
  } else {
    return position.with({ character: position.character - 1 });
  }
}
function rightWrap(document, position) {
  const lineLength = document.lineAt(position.line).text.length;
  if (position.character >= lineLength) {
    if (position.line >= document.lineCount - 1) {
      return position;
    } else {
      return new vscode3.Position(position.line + 1, 0);
    }
  } else {
    return position.with({ character: position.character + 1 });
  }
}
function lineEnd(document, position) {
  const lineLength = document.lineAt(position.line).text.length;
  return position.with({
    character: lineLength
  });
}
function lastChar(document) {
  return new vscode3.Position(
    document.lineCount - 1,
    document.lineAt(document.lineCount - 1).text.length
  );
}

// src/type_subscription.ts
var vscode4 = __toESM(require("vscode"));
function addTypeSubscription(vimState, typeHandler2) {
  vimState.typeSubscription = vscode4.commands.registerCommand("type", (e) => {
    typeHandler2(vimState, e.text);
  });
}
function removeTypeSubscription(vimState) {
  if (vimState.typeSubscription) {
    vimState.typeSubscription.dispose();
  }
}

// src/visual_line_utils.ts
var vscode5 = __toESM(require("vscode"));
function setVisualLineSelections(editor) {
  editor.selections = editor.selections.map((selection) => {
    if (!selection.isReversed || selection.isSingleLine) {
      const activeLineLength = editor.document.lineAt(selection.active.line).text.length;
      return new vscode5.Selection(
        selection.anchor.with({ character: 0 }),
        selection.active.with({ character: activeLineLength })
      );
    } else {
      const anchorLineLength = editor.document.lineAt(selection.anchor.line).text.length;
      return new vscode5.Selection(
        selection.anchor.with({ character: anchorLineLength }),
        selection.active.with({ character: 0 })
      );
    }
  });
}

// src/yank_highlight.ts
var vscode6 = __toESM(require("vscode"));
function flashYankHighlight(editor, ranges) {
  const decoration = vscode6.window.createTextEditorDecorationType({
    backgroundColor: vscode6.workspace.getConfiguration("simpleVim").get("yankHighlightBackgroundColor")
  });
  editor.setDecorations(decoration, ranges);
  setTimeout(() => decoration.dispose(), 200);
}

// src/put_utils/put_after.ts
var vscode8 = __toESM(require("vscode"));

// src/put_utils/common.ts
var vscode7 = __toESM(require("vscode"));
function getRegisterContentsList(vimState, editor) {
  if (vimState.registers.contentsList.length === 0)
    return void 0;
  let registerContentsList = vimState.registers.contentsList;
  if (vimState.registers.contentsList.length !== editor.selections.length) {
    const combinedContents = vimState.registers.contentsList.join("\n");
    registerContentsList = editor.selections.map((selection) => combinedContents);
  }
  return registerContentsList;
}
function getInsertRangesFromEnd(document, positions, contentsList) {
  return positions.map((position, i) => {
    const contents = contentsList[i];
    if (!contents)
      return void 0;
    const lines = contents.split(/\r?\n/);
    let beginningPosition;
    if (lines.length > 1) {
      const beginningLine = position.line - (lines.length - 1);
      const beginningCharacter = document.lineAt(beginningLine).text.length - lines[0].length;
      beginningPosition = new vscode7.Position(
        beginningLine,
        beginningCharacter
      );
    } else {
      beginningPosition = position.with({
        character: position.character - lines[0].length
      });
    }
    return new vscode7.Range(beginningPosition, position);
  });
}
function getInsertRangesFromBeginning(positions, contentsList) {
  return positions.map((position, i) => {
    const contents = contentsList[i];
    if (!contents)
      return void 0;
    const lines = contents.split(/\r?\n/);
    const endLine = position.line + lines.length - 1;
    const endCharacter = lines.length === 1 ? position.character + lines[0].length : lines[lines.length - 1].length;
    return new vscode7.Range(
      position,
      new vscode7.Position(endLine, endCharacter)
    );
  });
}
function adjustInsertPositions(positions, contentsList) {
  const indexPositions = positions.map((position, i) => ({
    originalIndex: i,
    position
  }));
  indexPositions.sort((a, b) => {
    if (a.position.isBefore(b.position))
      return -1;
    else if (a.position.isEqual(b.position))
      return 0;
    else
      return 1;
  });
  const adjustedIndexPositions = [];
  let lineOffset = 0;
  let characterOffset = 0;
  let lineNumber = 0;
  for (const indexPosition of indexPositions) {
    const adjustedLine = indexPosition.position.line + lineOffset;
    let adjustedCharacter = indexPosition.position.character;
    if (indexPosition.position.line === lineNumber) {
      adjustedCharacter += characterOffset;
    }
    adjustedIndexPositions.push({
      originalIndex: indexPosition.originalIndex,
      position: new vscode7.Position(adjustedLine, adjustedCharacter)
    });
    const contents = contentsList[indexPosition.originalIndex];
    if (contents !== void 0) {
      const contentsLines = contents.split(/\r?\n/);
      lineOffset += contentsLines.length - 1;
      if (indexPosition.position.line === lineNumber) {
        if (contentsLines.length === 1) {
          characterOffset += contentsLines[0].length;
        } else {
          characterOffset += contentsLines[contentsLines.length - 1].length - indexPosition.position.character;
        }
      } else {
        characterOffset = 0;
        lineNumber = indexPosition.position.line;
      }
    }
  }
  adjustedIndexPositions.sort((a, b) => a.originalIndex - b.originalIndex);
  return adjustedIndexPositions.map((indexPosition) => indexPosition.position);
}

// src/put_utils/put_after.ts
function putAfter(vimState, editor) {
  const registerContentsList = getRegisterContentsList(vimState, editor);
  if (registerContentsList === void 0)
    return;
  if (vimState.mode === 1 /* Normal */) {
    if (vimState.registers.linewise) {
      normalModeLinewise(vimState, editor, registerContentsList);
    } else {
      normalModeCharacterwise(vimState, editor, registerContentsList);
    }
  } else if (vimState.mode === 2 /* Visual */) {
    visualMode(vimState, editor, registerContentsList);
  } else {
    visualLineMode(vimState, editor, registerContentsList);
  }
}
function normalModeLinewise(vimState, editor, registerContentsList) {
  const insertContentsList = registerContentsList.map((contents) => {
    if (contents === void 0)
      return void 0;
    else
      return "\n" + contents;
  });
  const insertPositions = editor.selections.map((selection) => {
    const lineLength = editor.document.lineAt(selection.active.line).text.length;
    return new vscode8.Position(selection.active.line, lineLength);
  });
  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    insertContentsList
  );
  const rangeBeginnings = adjustedInsertPositions.map(
    (position) => new vscode8.Position(position.line + 1, 0)
  );
  editor.edit((editBuilder) => {
    insertPositions.forEach((position, i) => {
      const contents = insertContentsList[i];
      if (contents === void 0)
        return;
      editBuilder.insert(position, contents);
    });
  }).then(() => {
    editor.selections = rangeBeginnings.map(
      (position) => new vscode8.Selection(position, position)
    );
  });
  vimState.lastPutRanges = {
    ranges: getInsertRangesFromBeginning(rangeBeginnings, registerContentsList),
    linewise: true
  };
}
function normalModeCharacterwise(vimState, editor, registerContentsList) {
  const insertPositions = editor.selections.map((selection) => {
    return right(editor.document, selection.active);
  });
  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    registerContentsList
  );
  const insertRanges = getInsertRangesFromBeginning(
    adjustedInsertPositions,
    registerContentsList
  );
  editor.edit((editBuilder) => {
    insertPositions.forEach((insertPosition, i) => {
      const registerContents = registerContentsList[i];
      if (registerContents === void 0)
        return;
      editBuilder.insert(insertPosition, registerContents);
    });
  }).then(() => {
    editor.selections = editor.selections.map((selection, i) => {
      const range = insertRanges[i];
      if (range === void 0)
        return selection;
      const position = left(range.end);
      return new vscode8.Selection(position, position);
    });
  });
  vimState.lastPutRanges = {
    ranges: insertRanges,
    linewise: false
  };
}
function visualMode(vimState, editor, registerContentsList) {
  const insertContentsList = vimState.registers.linewise ? registerContentsList.map((contents) => {
    if (!contents)
      return void 0;
    else
      return "\n" + contents + "\n";
  }) : registerContentsList;
  editor.edit((editBuilder) => {
    editor.selections.forEach((selection, i) => {
      const contents = insertContentsList[i];
      if (contents === void 0)
        return;
      editBuilder.delete(selection);
      editBuilder.insert(selection.start, contents);
    });
  }).then(() => {
    vimState.lastPutRanges = {
      ranges: getInsertRangesFromEnd(
        editor.document,
        editor.selections.map((selection) => selection.active),
        insertContentsList
      ),
      linewise: vimState.registers.linewise
    };
    editor.selections = editor.selections.map((selection) => {
      const newPosition = left(selection.active);
      return new vscode8.Selection(newPosition, newPosition);
    });
  });
  enterNormalMode(vimState);
  setModeCursorStyle(vimState.mode, editor);
}
function visualLineMode(vimState, editor, registerContentsList) {
  editor.edit((editBuilder) => {
    editor.selections.forEach((selection, i) => {
      const registerContents = registerContentsList[i];
      if (registerContents === void 0)
        return;
      editBuilder.replace(selection, registerContents);
    });
  }).then(() => {
    vimState.lastPutRanges = {
      ranges: editor.selections.map(
        (selection) => new vscode8.Range(selection.start, selection.end)
      ),
      linewise: vimState.registers.linewise
    };
    editor.selections = editor.selections.map((selection) => {
      return new vscode8.Selection(selection.start, selection.start);
    });
    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  });
}

// src/put_utils/put_before.ts
var vscode9 = __toESM(require("vscode"));
function putBefore(vimState, editor) {
  const registerContentsList = getRegisterContentsList(vimState, editor);
  if (registerContentsList === void 0)
    return;
  if (vimState.registers.linewise) {
    normalModeLinewise2(vimState, editor, registerContentsList);
  } else {
    normalModeCharacterwise2(vimState, editor, registerContentsList);
  }
}
function normalModeLinewise2(vimState, editor, registerContentsList) {
  const insertContentsList = registerContentsList.map((contents) => {
    if (contents === void 0)
      return void 0;
    else
      return contents + "\n";
  });
  const insertPositions = editor.selections.map((selection) => {
    return new vscode9.Position(selection.active.line, 0);
  });
  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    insertContentsList
  );
  editor.edit((editBuilder) => {
    insertPositions.forEach((position, i) => {
      const contents = insertContentsList[i];
      if (contents === void 0)
        return;
      editBuilder.insert(position, contents);
    });
  }).then(() => {
    editor.selections = editor.selections.map((selection, i) => {
      const position = adjustedInsertPositions[i];
      if (position === void 0)
        return selection;
      return new vscode9.Selection(position, position);
    });
  });
  vimState.lastPutRanges = {
    ranges: getInsertRangesFromBeginning(
      adjustedInsertPositions,
      registerContentsList
    ),
    linewise: true
  };
}
function normalModeCharacterwise2(vimState, editor, registerContentsList) {
  const insertPositions = editor.selections.map((selection) => selection.active);
  const adjustedInsertPositions = adjustInsertPositions(
    insertPositions,
    registerContentsList
  );
  const insertRanges = getInsertRangesFromBeginning(
    adjustedInsertPositions,
    registerContentsList
  );
  editor.edit((editBuilder) => {
    insertPositions.forEach((insertPosition, i) => {
      const registerContents = registerContentsList[i];
      if (registerContents === void 0)
        return;
      editBuilder.insert(insertPosition, registerContents);
    });
  }).then(() => {
    editor.selections = editor.selections.map((selection, i) => {
      const range = insertRanges[i];
      if (range === void 0)
        return selection;
      const position = left(range.end);
      return new vscode9.Selection(position, position);
    });
  });
  vimState.lastPutRanges = {
    ranges: insertRanges,
    linewise: false
  };
}

// src/actions/operators.ts
var vscode14 = __toESM(require("vscode"));

// src/actions/operator_ranges.ts
var vscode13 = __toESM(require("vscode"));

// src/search_utils.ts
var vscode10 = __toESM(require("vscode"));
function searchForward(document, needle, fromPosition) {
  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;
    const matchIndex = lineText.indexOf(needle, fromIndex);
    if (matchIndex >= 0) {
      return new vscode10.Position(i, matchIndex);
    }
  }
  return void 0;
}
function searchBackward(document, needle, fromPosition) {
  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : Infinity;
    const matchIndex = lineText.lastIndexOf(needle, fromIndex);
    if (matchIndex >= 0) {
      return new vscode10.Position(i, matchIndex);
    }
  }
  return void 0;
}
function searchForwardBracket(document, openingChar, closingChar, fromPosition) {
  let n = 0;
  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;
    for (let j = fromIndex; j < lineText.length; ++j) {
      if (lineText[j] === openingChar) {
        ++n;
      } else if (lineText[j] === closingChar) {
        if (n === 0) {
          return new vscode10.Position(i, j);
        } else {
          --n;
        }
      }
    }
  }
  return void 0;
}
function searchBackwardBracket(document, openingChar, closingChar, fromPosition) {
  let n = 0;
  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : lineText.length - 1;
    for (let j = fromIndex; j >= 0; --j) {
      if (lineText[j] === closingChar) {
        ++n;
      } else if (lineText[j] === openingChar) {
        if (n === 0) {
          return new vscode10.Position(i, j);
        } else {
          --n;
        }
      }
    }
  }
  return void 0;
}

// src/word_utils.ts
var NON_WORD_CHARACTERS = "/\\()\"':,.;<>~!@#$%^&*|+=[]{}`?-";
function whitespaceWordRanges(text) {
  let State;
  ((State2) => {
    State2[State2["Whitespace"] = 0] = "Whitespace";
    State2[State2["Word"] = 1] = "Word";
  })(State || (State = {}));
  let state = 0 /* Whitespace */;
  let startIndex = 0;
  const ranges = [];
  for (let i = 0; i < text.length; ++i) {
    const char = text[i];
    if (state === 0 /* Whitespace */) {
      if (!isWhitespaceCharacter(char)) {
        startIndex = i;
        state = 1 /* Word */;
      }
    } else {
      if (isWhitespaceCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });
        state = 0 /* Whitespace */;
      }
    }
  }
  if (state === 1 /* Word */) {
    ranges.push({
      start: startIndex,
      end: text.length - 1
    });
  }
  return ranges;
}
function wordRanges(text) {
  let State;
  ((State2) => {
    State2[State2["Whitespace"] = 0] = "Whitespace";
    State2[State2["Word"] = 1] = "Word";
    State2[State2["NonWord"] = 2] = "NonWord";
  })(State || (State = {}));
  let state = 0 /* Whitespace */;
  let startIndex = 0;
  const ranges = [];
  for (let i = 0; i < text.length; ++i) {
    const char = text[i];
    if (state === 0 /* Whitespace */) {
      if (!isWhitespaceCharacter(char)) {
        startIndex = i;
        state = isWordCharacter(char) ? 1 /* Word */ : 2 /* NonWord */;
      }
    } else if (state === 1 /* Word */) {
      if (!isWordCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });
        if (isWhitespaceCharacter(char)) {
          state = 0 /* Whitespace */;
        } else {
          state = 2 /* NonWord */;
          startIndex = i;
        }
      }
    } else {
      if (!isNonWordCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });
        if (isWhitespaceCharacter(char)) {
          state = 0 /* Whitespace */;
        } else {
          state = 1 /* Word */;
          startIndex = i;
        }
      }
    }
  }
  if (state !== 0 /* Whitespace */) {
    ranges.push({
      start: startIndex,
      end: text.length - 1
    });
  }
  return ranges;
}
function isNonWordCharacter(char) {
  return NON_WORD_CHARACTERS.indexOf(char) >= 0;
}
function isWhitespaceCharacter(char) {
  return char === " " || char === "	";
}
function isWordCharacter(char) {
  return !isWhitespaceCharacter(char) && !isNonWordCharacter(char);
}

// src/paragraph_utils.ts
function paragraphForward(document, line) {
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
function paragraphBackward(document, line) {
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
function paragraphRangeOuter(document, line) {
  if (document.lineAt(line).isEmptyOrWhitespace)
    return void 0;
  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardOuter(document, line + 1)
  };
}
function paragraphRangeForwardOuter(document, line) {
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
function paragraphRangeBackward(document, line) {
  for (let i = line; i >= 0; --i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i + 1;
    }
  }
  return 0;
}
function paragraphRangeInner(document, line) {
  if (document.lineAt(line).isEmptyOrWhitespace)
    return void 0;
  return {
    start: paragraphRangeBackward(document, line - 1),
    end: paragraphRangeForwardInner(document, line + 1)
  };
}
function paragraphRangeForwardInner(document, line) {
  for (let i = line; i < document.lineCount; ++i) {
    if (document.lineAt(i).isEmptyOrWhitespace) {
      return i - 1;
    }
  }
  return document.lineCount - 1;
}

// src/quote_utils.ts
function findQuoteRange(ranges, position) {
  const insideResult = ranges.find(
    (x) => x.start <= position.character && x.end >= position.character
  );
  if (insideResult) {
    return insideResult;
  }
  const outsideResult = ranges.find((x) => x.start > position.character);
  if (outsideResult) {
    return outsideResult;
  }
  return void 0;
}
function quoteRanges(quoteChar, s) {
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

// src/indent_utils.ts
function indentLevelRange(document, lineNumber) {
  const indentLevel = findIndentLevel(document, lineNumber);
  const rangeStart = indentLevelRangeBefore(document, lineNumber, indentLevel);
  const rangeEnd = indentLevelRangeAfter(document, lineNumber + 1, indentLevel);
  if (rangeStart && rangeEnd) {
    return { start: rangeStart.start, end: rangeEnd.end };
  } else if (rangeStart) {
    return rangeStart;
  } else if (rangeEnd) {
    return rangeEnd;
  } else {
    return { start: lineNumber, end: lineNumber };
  }
}
function indentLevelRangeBefore(document, lineNumber, indentLevel) {
  let result;
  for (let i = lineNumber; i >= 0; --i) {
    const line = document.lineAt(i);
    if (line.firstNonWhitespaceCharacterIndex >= indentLevel) {
      if (result) {
        result.start = i;
      } else {
        result = { start: i, end: i };
      }
    } else {
      if (!line.isEmptyOrWhitespace) {
        return result;
      }
    }
  }
  return result;
}
function indentLevelRangeAfter(document, lineNumber, indentLevel) {
  let result;
  for (let i = lineNumber; i < document.lineCount; ++i) {
    const line = document.lineAt(i);
    if (line.firstNonWhitespaceCharacterIndex >= indentLevel) {
      if (result) {
        result.end = i;
      } else {
        result = { start: i, end: i };
      }
    } else {
      if (!line.isEmptyOrWhitespace) {
        return result;
      }
    }
  }
  return result;
}
function findIndentLevel(document, lineNumber) {
  const line = document.lineAt(lineNumber);
  if (!line.isEmptyOrWhitespace) {
    return line.firstNonWhitespaceCharacterIndex;
  }
  return Math.max(
    findIndentLevelForward(document, lineNumber + 1),
    findIndentLevelBackward(document, lineNumber - 1)
  );
}
function findIndentLevelForward(document, lineNumber) {
  for (let i = lineNumber; i < document.lineCount; ++i) {
    const line = document.lineAt(i);
    if (!line.isEmptyOrWhitespace) {
      return line.firstNonWhitespaceCharacterIndex;
    }
  }
  return 0;
}
function findIndentLevelBackward(document, lineNumber) {
  for (let i = lineNumber; i >= 0; --i) {
    const line = document.lineAt(i);
    if (!line.isEmptyOrWhitespace) {
      return line.firstNonWhitespaceCharacterIndex;
    }
  }
  return 0;
}

// src/block_utils.ts
var vscode11 = __toESM(require("vscode"));
var startRegex = (startWords) => RegExp(`(^|\\s)(${startWords.join("|")})($|\\s)`, "g");
var endRegex = (endWords) => RegExp(`(^|\\s)(${endWords.join("|")})($|\\W)`, "g");
function blockRange(document, position) {
  let startWords = [];
  let endWords = [];
  console.log(`LanguageID=${document.languageId}`);
  if (document.languageId === "elixir") {
    startWords = ["case", "cond", "fn", "def"];
    endWords = ["end"];
  } else {
    console.log(`Unsupported language: ${document.languageId}`);
    return new vscode11.Range(position, position);
  }
  const start = findBlockStart(document, position, startWords, endWords);
  const end = findBlockEnd(document, position, startWords, endWords);
  if (start && end) {
    return new vscode11.Range(start, end);
  }
  return new vscode11.Range(position, position);
}
function findBlockStart(document, position, startWords, endWords) {
  let closedBlocks = [];
  for (let i = position.line; i >= 0; --i) {
    let lineText = i === position.line ? document.lineAt(i).text.substr(position.character) : document.lineAt(i).text;
    let blockMatches = [];
    for (const m of lineText.matchAll(startRegex(startWords))) {
      blockMatches.push({ type: "start" /* start */, match: m });
    }
    for (const m of lineText.matchAll(endRegex(endWords))) {
      blockMatches.push({ type: "end" /* end */, match: m });
    }
    blockMatches = blockMatches.sort(
      (a, b) => a.match.index > b.match.index ? 1 : -1
    );
    for (let idx = 0; idx < blockMatches.length; idx++) {
      const blockMatch = blockMatches[idx];
      if (blockMatch.type === "end" /* end */) {
        closedBlocks.push(true);
      } else if (blockMatch.type === "start" /* start */) {
        if (closedBlocks.length === 0) {
          const [fullText, , matchText] = blockMatch.match;
          const offset = fullText.indexOf(matchText);
          return new vscode11.Position(
            i,
            blockMatch.match.index + offset
          );
        } else {
          closedBlocks.pop();
        }
      }
    }
  }
  return void 0;
}
function findBlockEnd(document, position, startWords, endWords) {
  let openedBlocks = [true];
  for (let i = position.line; i < document.lineCount; ++i) {
    let lineText = i === position.line ? document.lineAt(i).text.substr(position.character) : document.lineAt(i).text;
    let blockMatches = [];
    for (const m of lineText.matchAll(startRegex(startWords))) {
      blockMatches.push({ type: "start" /* start */, match: m });
    }
    for (const m of lineText.matchAll(endRegex(endWords))) {
      blockMatches.push({ type: "end" /* end */, match: m });
    }
    blockMatches = blockMatches.sort(
      (a, b) => a.match.index > b.match.index ? 1 : -1
    );
    for (let idx = 0; idx < blockMatches.length; idx++) {
      const blockMatch = blockMatches[idx];
      if (blockMatch.type === "start" /* start */) {
        openedBlocks.push(true);
      } else if (blockMatch.type === "end" /* end */) {
        openedBlocks.pop();
        if (openedBlocks.length === 0) {
          const [fullText, , matchText] = blockMatch.match;
          const offset = fullText.indexOf(matchText);
          return new vscode11.Position(
            i,
            blockMatch.match.index + offset + matchText.length
          );
        }
      }
    }
  }
  return void 0;
}

// src/tag_utils.ts
var vscode12 = __toESM(require("vscode"));
var OPEN_SLASH_GROUP = 1;
var TAG_NAME_GROUP = 2;
var CLOSE_SLASH_GROUP = 3;
function getTags(document) {
  return positionTags(document, matchTags(getPartialTags(document.getText())));
}
function positionTags(document, offsetTags) {
  return offsetTags.map((tag) => {
    const openingRange = new vscode12.Range(
      document.positionAt(tag.opening.start),
      document.positionAt(tag.opening.end)
    );
    if (tag.closing) {
      return {
        name: tag.name,
        opening: openingRange,
        closing: new vscode12.Range(
          document.positionAt(tag.closing.start),
          document.positionAt(tag.closing.end)
        )
      };
    } else {
      return {
        name: tag.name,
        opening: openingRange
      };
    }
  });
}
function matchTags(partialTags) {
  const tags = [];
  const openingStack = [];
  partialTags.forEach((partialTag) => {
    if (partialTag.kind === "opening") {
      openingStack.push(partialTag);
    } else if (partialTag.kind === "self_closing") {
      tags.push({
        name: partialTag.name,
        opening: partialTag.range
      });
    } else if (partialTag.kind === "closing") {
      let stackTag = openingStack.pop();
      while (stackTag) {
        if (stackTag.name === partialTag.name) {
          tags.push({
            name: stackTag.name,
            opening: stackTag.range,
            closing: partialTag.range
          });
          break;
        } else {
          tags.push({
            name: stackTag.name,
            opening: stackTag.range
          });
        }
        stackTag = openingStack.pop();
      }
    }
  });
  return tags.sort((a, b) => a.opening.start - b.opening.start);
}
function getPartialTags(text) {
  const regex = /\<(\/)?([^\>\<\s]+)[^\>\<]*?(\/?)\>/g;
  const tagRanges = [];
  let match = regex.exec(text);
  while (match) {
    const name = match[TAG_NAME_GROUP];
    const range = { start: match.index, end: regex.lastIndex - 1 };
    if (match[CLOSE_SLASH_GROUP]) {
      tagRanges.push({ kind: "self_closing", name, range });
    } else if (match[OPEN_SLASH_GROUP]) {
      tagRanges.push({ kind: "closing", name, range });
    } else {
      tagRanges.push({ kind: "opening", name, range });
    }
    match = regex.exec(text);
  }
  return tagRanges;
}

// src/array_utils.ts
function arrayFindLast(xs, p) {
  const filtered = xs.filter(p);
  if (filtered.length === 0) {
    return void 0;
  } else {
    return filtered[filtered.length - 1];
  }
}

// src/actions/operator_ranges.ts
var operatorRanges = [
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
        return new vscode13.Range(position, result);
      } else {
        return void 0;
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
        return new vscode13.Range(position, result);
      } else {
        return void 0;
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
        return new vscode13.Range(position, position.with({ character: result }));
      } else {
        return void 0;
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
        const newPosition = right(
          document,
          position.with({ character: result })
        );
        return new vscode13.Range(newPosition, position);
      } else {
        return void 0;
      }
    }
  ),
  createOperatorRangeExactKeys(
    ["g", "g"],
    true,
    (vimState, document, position) => {
      const lineLength = document.lineAt(position.line).text.length;
      return new vscode13.Range(
        new vscode13.Position(0, 0),
        position.with({ character: lineLength })
      );
    }
  ),
  createOperatorRangeExactKeys(["G"], true, (vimState, document, position) => {
    const lineLength = document.lineAt(document.lineCount - 1).text.length;
    return new vscode13.Range(
      position.with({ character: 0 }),
      new vscode13.Position(document.lineCount - 1, lineLength)
    );
  }),
  createOperatorRangeExactKeys(["}"], true, (vimState, document, position) => {
    return new vscode13.Range(
      position.with({ character: 0 }),
      new vscode13.Position(paragraphForward(document, position.line), 0)
    );
  }),
  createOperatorRangeExactKeys(["{"], true, (vimState, document, position) => {
    return new vscode13.Range(
      new vscode13.Position(paragraphBackward(document, position.line), 0),
      position.with({ character: 0 })
    );
  }),
  createOperatorRangeExactKeys(
    ["i", "p"],
    true,
    (vimState, document, position) => {
      const result = paragraphRangeInner(document, position.line);
      if (result) {
        return new vscode13.Range(
          new vscode13.Position(result.start, 0),
          new vscode13.Position(
            result.end,
            document.lineAt(result.end).text.length
          )
        );
      } else {
        return void 0;
      }
    }
  ),
  createOperatorRangeExactKeys(
    ["a", "p"],
    true,
    (vimState, document, position) => {
      const result = paragraphRangeOuter(document, position.line);
      if (result) {
        return new vscode13.Range(
          new vscode13.Position(result.start, 0),
          new vscode13.Position(
            result.end,
            document.lineAt(result.end).text.length
          )
        );
      } else {
        return void 0;
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
          return position.isAfterOrEqual(tag.opening.start) && position.isBeforeOrEqual(tag.closing.end);
        } else {
          return false;
        }
      });
      if (closestTag) {
        if (closestTag.closing) {
          return new vscode13.Range(
            closestTag.opening.end.with({
              character: closestTag.opening.end.character + 1
            }),
            closestTag.closing.start
          );
        } else {
          throw new Error(
            "We should have already filtered out self-closing tags above"
          );
        }
      } else {
        return void 0;
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
          return new vscode13.Range(
            closestTag.opening.start,
            closestTag.closing.end.with({
              character: closestTag.closing.end.character + 1
            })
          );
        } else {
          return new vscode13.Range(
            closestTag.opening.start,
            closestTag.opening.end.with({
              character: closestTag.opening.end.character + 1
            })
          );
        }
      } else {
        return void 0;
      }
    }
  ),
  createOperatorRangeExactKeys(
    ["i", "i"],
    true,
    (vimState, document, position) => {
      const simpleRange = indentLevelRange(document, position.line);
      return new vscode13.Range(
        new vscode13.Position(simpleRange.start, 0),
        new vscode13.Position(
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
  )
];
function createInnerBracketHandler(openingChar, closingChar) {
  return (vimState, document, position) => {
    const bracketRange = getBracketRange(
      document,
      position,
      openingChar,
      closingChar
    );
    if (bracketRange) {
      return new vscode13.Range(
        bracketRange.start.with({
          character: bracketRange.start.character + 1
        }),
        bracketRange.end
      );
    } else {
      return void 0;
    }
  };
}
function createOuterBracketHandler(openingChar, closingChar) {
  return (vimState, document, position) => {
    const bracketRange = getBracketRange(
      document,
      position,
      openingChar,
      closingChar
    );
    if (bracketRange) {
      return new vscode13.Range(
        bracketRange.start,
        bracketRange.end.with({ character: bracketRange.end.character + 1 })
      );
    } else {
      return void 0;
    }
  };
}
function getBracketRange(document, position, openingChar, closingChar) {
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
      rightWrap(document, position)
    );
  } else if (currentChar === closingChar) {
    start = searchBackwardBracket(
      document,
      openingChar,
      closingChar,
      leftWrap(document, position)
    );
    end = position;
  } else {
    start = searchBackwardBracket(document, openingChar, closingChar, position);
    end = searchForwardBracket(document, openingChar, closingChar, position);
  }
  if (start && end) {
    return new vscode13.Range(start, end);
  } else {
    return void 0;
  }
}
function createInnerQuoteHandler(quoteChar) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = quoteRanges(quoteChar, lineText);
    const result = findQuoteRange(ranges, position);
    if (result) {
      return new vscode13.Range(
        position.with({ character: result.start + 1 }),
        position.with({ character: result.end })
      );
    } else {
      return void 0;
    }
  };
}
function createOuterQuoteHandler(quoteChar) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = quoteRanges(quoteChar, lineText);
    const result = findQuoteRange(ranges, position);
    if (result) {
      return new vscode13.Range(
        position.with({ character: result.start }),
        position.with({ character: result.end + 1 })
      );
    } else {
      return void 0;
    }
  };
}
function createWordForwardHandler(wordRangesFunction) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);
    const result = ranges.find((x) => x.start > position.character);
    if (result) {
      return new vscode13.Range(
        position,
        position.with({ character: result.start })
      );
    } else {
      return new vscode13.Range(
        position,
        position.with({ character: lineText.length })
      );
    }
  };
}
function createWordBackwardHandler(wordRangesFunction) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);
    const result = ranges.reverse().find((x) => x.start < position.character);
    if (result) {
      return new vscode13.Range(
        position.with({ character: result.start }),
        position
      );
    } else {
      return void 0;
    }
  };
}
function createWordEndHandler(wordRangesFunction) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);
    const result = ranges.find((x) => x.end > position.character);
    if (result) {
      return new vscode13.Range(
        position,
        right(document, position.with({ character: result.end }))
      );
    } else {
      return void 0;
    }
  };
}
function createInnerWordHandler(wordRangesFunction) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);
    const result = ranges.find(
      (x) => x.start <= position.character && position.character <= x.end
    );
    if (result) {
      return new vscode13.Range(
        position.with({ character: result.start }),
        right(document, position.with({ character: result.end }))
      );
    } else {
      return void 0;
    }
  };
}
function createOuterWordHandler(wordRangesFunction) {
  return (vimState, document, position) => {
    const lineText = document.lineAt(position.line).text;
    const ranges = wordRangesFunction(lineText);
    for (let i = 0; i < ranges.length; ++i) {
      const range = ranges[i];
      if (range.start <= position.character && position.character <= range.end) {
        if (i < ranges.length - 1) {
          return new vscode13.Range(
            position.with({ character: range.start }),
            position.with({ character: ranges[i + 1].start })
          );
        } else if (i > 0) {
          return new vscode13.Range(
            right(
              document,
              position.with({ character: ranges[i - 1].end })
            ),
            right(
              document,
              position.with({ character: range.end })
            )
          );
        } else {
          return new vscode13.Range(
            position.with({ character: range.start }),
            right(
              document,
              position.with({ character: range.end })
            )
          );
        }
      }
    }
    return void 0;
  };
}

// src/actions/operators.ts
var operators = [
  parseKeysOperator(
    ["d"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0))
        return;
      cursorsToRangesStart(editor, ranges);
      delete_(editor, ranges, linewise);
      if (vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      }
    }
  ),
  parseKeysOperator(
    ["c"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0))
        return;
      cursorsToRangesStart(editor, ranges);
      editor.edit((editBuilder) => {
        ranges.forEach((range) => {
          if (!range)
            return;
          editBuilder.delete(range);
        });
      });
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysOperator(
    ["y"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0))
        return;
      yank(vimState, editor, ranges, linewise);
      if (vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
        editor.selections = editor.selections.map((selection) => {
          return new vscode14.Selection(selection.start, selection.start);
        });
        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      } else {
        const highlightRanges = [];
        ranges.forEach((range) => {
          if (range) {
            highlightRanges.push(new vscode14.Range(range.start, range.end));
          }
        });
        flashYankHighlight(editor, highlightRanges);
      }
    }
  ),
  parseKeysOperator(
    ["r"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0))
        return;
      cursorsToRangesStart(editor, ranges);
      yank(vimState, editor, ranges, linewise);
      delete_(editor, ranges, linewise);
      if (vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
        enterNormalMode(vimState);
        setModeCursorStyle(vimState.mode, editor);
      }
    }
  ),
  parseKeysOperator(
    ["s"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0) || vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
        return;
      }
      editor.selections = ranges.map((range, i) => {
        if (range) {
          const start = range.start;
          const end = range.end;
          return new vscode14.Selection(start, end);
        } else {
          return editor.selections[i];
        }
      });
      if (linewise) {
        enterVisualLineMode(vimState);
      } else {
        enterVisualMode(vimState);
      }
      setModeCursorStyle(vimState.mode, editor);
    }
  ),
  parseKeysOperator(
    ["q"],
    operatorRanges,
    (vimState, editor, ranges, linewise) => {
      if (ranges.every((x) => x === void 0) || vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
        return;
      }
      editor.selections = ranges.map((range, i) => {
        if (range) {
          const start = range.start;
          const end = range.end;
          return new vscode14.Selection(start, end);
        } else {
          return editor.selections[i];
        }
      });
      vscode14.commands.executeCommand("editor.action.copyLinesDownAction");
    }
  )
];
function cursorsToRangesStart(editor, ranges) {
  editor.selections = editor.selections.map((selection, i) => {
    const range = ranges[i];
    if (range) {
      const newPosition = range.start;
      return new vscode14.Selection(newPosition, newPosition);
    } else {
      return selection;
    }
  });
}
function delete_(editor, ranges, linewise) {
  editor.edit((editBuilder) => {
    ranges.forEach((range) => {
      if (!range)
        return;
      let deleteRange = range;
      if (linewise) {
        const start = range.start;
        const end = range.end;
        if (end.line === editor.document.lineCount - 1) {
          if (start.line === 0) {
            deleteRange = new vscode14.Range(start.with({ character: 0 }), end);
          } else {
            deleteRange = new vscode14.Range(
              new vscode14.Position(
                start.line - 1,
                editor.document.lineAt(start.line - 1).text.length
              ),
              end
            );
          }
        } else {
          deleteRange = new vscode14.Range(
            range.start,
            new vscode14.Position(end.line + 1, 0)
          );
        }
      }
      editBuilder.delete(deleteRange);
    });
  }).then(() => {
    editor.selections = editor.selections.map((selection, i) => {
      const range = ranges[i];
      if (range && linewise) {
        const newPosition = selection.start.with({ character: 0 });
        return new vscode14.Selection(newPosition, newPosition);
      } else {
        return selection;
      }
    });
  });
}
function yank(vimState, editor, ranges, linewise) {
  vimState.registers = {
    contentsList: ranges.map((range, i) => {
      if (range) {
        return editor.document.getText(range);
      } else {
        return vimState.registers.contentsList[i];
      }
    }),
    linewise
  };
}

// src/actions/keymaps.ts
var keymaps_default = {
  Motions: {
    MoveLeft: "j",
    MoveRight: "l",
    MoveDown: "k",
    MoveUp: "i",
    MoveLineEnd: "o",
    MoveLineStart: "u"
  },
  Actions: {
    InsertMode: "h",
    InsertAtLineStart: "U",
    InsertAtLineEnd: "O",
    NewLineAbove: "I",
    NewLineBelow: "K"
  }
};

// src/actions/actions.ts
var actions = [
  parseKeysExact([":"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("workbench.action.gotoLine");
  }),
  parseKeysExact(["m", "l"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("bookmarks.list");
  }),
  parseKeysExact(["m", "L"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("bookmarks.listFromAllFiles");
  }),
  parseKeysExact(["m", "i"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("bookmarks.jumpToPrevious");
  }),
  parseKeysExact(["m", "k"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("bookmarks.jumpToNext");
  }),
  parseKeysExact(["m", "m"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("bookmarks.toggle");
  }),
  parseKeysExact([" ", " "], [1 /* Normal */], (vimState, editor) => {
    enterOccurrenceMode(vimState);
    vscode15.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
  }),
  parseKeysExact(["p"], [4 /* Occurrence */], (vimState, editor) => {
    vscode15.commands.executeCommand(
      "editor.action.addSelectionToPreviousFindMatch"
    );
  }),
  parseKeysExact(["n"], [4 /* Occurrence */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
  }),
  parseKeysExact(["a"], [4 /* Occurrence */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.selectHighlights");
  }),
  parseKeysExact([" ", "z"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("undo");
  }),
  parseKeysExact([" ", "r"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("redo");
  }),
  parseKeysExact([" ", "i"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("extension.simpleVim.scrollUpHalfPage");
  }),
  parseKeysExact([" ", "k"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("extension.simpleVim.scrollDownHalfPage");
  }),
  parseKeysExact(["g", "l"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand(
      "workbench.action.navigateToLastEditLocation"
    );
  }),
  parseKeysExact(["g", "R"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("references-view.find");
  }),
  parseKeysExact(["g", "r"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.referenceSearch.trigger");
  }),
  parseKeysExact(["g", "d"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.revealDefinition");
  }),
  parseKeysExact(["g", "D"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.revealDefinitionAside");
  }),
  parseKeysExact(["g", "p"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.peekDefinition");
  }),
  parseKeysExact(["g", "s"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("extension.dash.specific");
  }),
  parseKeysExact(["g", "h"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.showHover");
  }),
  parseKeysExact(["g", "U"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.transformToUppercase");
  }),
  parseKeysExact(["g", "u"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("editor.action.transformToLowercase");
  }),
  parseKeysExact(
    [keymaps_default.Actions.InsertMode],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */, 4 /* Occurrence */],
    (vimState, editor) => {
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysExact(
    [keymaps_default.Actions.InsertAtLineStart],
    [1 /* Normal */],
    (vimState, editor) => {
      editor.selections = editor.selections.map((selection) => {
        const character = editor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
        const newPosition = selection.active.with({ character });
        return new vscode15.Selection(newPosition, newPosition);
      });
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysExact(["a"], [1 /* Normal */], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = right(
        editor.document,
        selection.active
      );
      return new vscode15.Selection(newPosition, newPosition);
    });
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),
  parseKeysExact(
    [keymaps_default.Actions.InsertAtLineEnd],
    [1 /* Normal */],
    (vimState, editor) => {
      editor.selections = editor.selections.map((selection) => {
        const lineLength = editor.document.lineAt(selection.active.line).text.length;
        const newPosition = selection.active.with({ character: lineLength });
        return new vscode15.Selection(newPosition, newPosition);
      });
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysExact(["v"], [1 /* Normal */, 3 /* VisualLine */], (vimState, editor) => {
    if (vimState.mode === 1 /* Normal */) {
      editor.selections = editor.selections.map((selection) => {
        const lineLength = editor.document.lineAt(selection.active.line).text.length;
        if (lineLength === 0)
          return selection;
        return new vscode15.Selection(
          selection.active,
          right(editor.document, selection.active)
        );
      });
    }
    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),
  parseKeysExact(["V"], [1 /* Normal */, 2 /* Visual */], (vimState, editor) => {
    enterVisualLineMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    setVisualLineSelections(editor);
  }),
  parseKeysExact(
    [keymaps_default.Actions.NewLineBelow],
    [1 /* Normal */],
    (vimState, editor) => {
      vscode15.commands.executeCommand("editor.action.insertLineAfter");
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysExact(
    [keymaps_default.Actions.NewLineAbove],
    [1 /* Normal */],
    (vimState, editor) => {
      vscode15.commands.executeCommand("editor.action.insertLineBefore");
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysExact(["P"], [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */], putAfter),
  parseKeysExact(["p"], [1 /* Normal */], putBefore),
  parseKeysExact(["d", "d"], [1 /* Normal */], (vimState, editor) => {
    deleteLine(vimState, editor);
  }),
  parseKeysExact(["D"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("deleteAllRight");
  }),
  parseKeysRegex(
    /^x(.)$/,
    /^x$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      editor.edit((builder) => {
        editor.selections.forEach((s) => {
          let oneChar = s.with({
            end: s.active.with({
              character: s.active.character + 1
            })
          });
          builder.replace(oneChar, match[1]);
        });
      });
    }
  ),
  parseKeysRegex(
    RegExp(`^d(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(d|d\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      deleteLines(vimState, editor, lineCount, direction);
    }
  ),
  parseKeysRegex(
    RegExp(`^c(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(c|c\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      deleteLines(vimState, editor, lineCount, direction);
      enterInsertMode(vimState);
      setModeCursorStyle(vimState.mode, editor);
      removeTypeSubscription(vimState);
    }
  ),
  parseKeysRegex(
    RegExp(`^s(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(s|s\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      editor.selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
    }
  ),
  parseKeysRegex(
    RegExp(`^y(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(y|y\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      let selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
      yank(vimState, editor, selections, true);
      flashYankHighlight(editor, selections);
    }
  ),
  parseKeysRegex(
    RegExp(`^r(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(r|r\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      let selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
      yank(vimState, editor, selections, true);
      deleteLines(vimState, editor, lineCount, direction);
    }
  ),
  parseKeysRegex(
    RegExp(`^q(\\d+)(${keymaps_default.Motions.MoveUp}|${keymaps_default.Motions.MoveDown})$`),
    /^(q|q\d+)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      let lineCount = parseInt(match[1]);
      let direction = match[2] == keymaps_default.Motions.MoveUp ? 0 /* Up */ : 1 /* Down */;
      editor.selections = makeMultiLineSelection(
        vimState,
        editor,
        lineCount,
        direction
      );
      vscode15.commands.executeCommand("editor.action.copyLinesDownAction");
    }
  ),
  parseKeysExact(["c", "c"], [1 /* Normal */], (vimState, editor) => {
    editor.edit((editBuilder) => {
      editor.selections.forEach((selection) => {
        const line = editor.document.lineAt(selection.active.line);
        editBuilder.delete(
          new vscode15.Range(
            selection.active.with({
              character: line.firstNonWhitespaceCharacterIndex
            }),
            selection.active.with({ character: line.text.length })
          )
        );
      });
    });
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),
  parseKeysExact(["C"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("deleteAllRight");
    enterInsertMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    removeTypeSubscription(vimState);
  }),
  parseKeysExact(["y", "y"], [1 /* Normal */], (vimState, editor) => {
    yankLine(vimState, editor);
    const highlightRanges = editor.selections.map((selection) => {
      const lineLength = editor.document.lineAt(selection.active.line).text.length;
      return new vscode15.Range(
        selection.active.with({ character: 0 }),
        selection.active.with({ character: lineLength })
      );
    });
    flashYankHighlight(editor, highlightRanges);
  }),
  parseKeysExact(["Y"], [1 /* Normal */], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);
    const highlightRanges = editor.selections.map((selection) => {
      const lineLength = editor.document.lineAt(selection.active.line).text.length;
      return new vscode15.Range(
        selection.active,
        selection.active.with({ character: lineLength })
      );
    });
    flashYankHighlight(editor, highlightRanges);
  }),
  parseKeysExact(["q", "q"], [1 /* Normal */, 2 /* Visual */], () => {
    vscode15.commands.executeCommand("editor.action.copyLinesDownAction");
  }),
  parseKeysExact(["Q", "Q"], [1 /* Normal */, 2 /* Visual */], () => {
    vscode15.commands.executeCommand("editor.action.copyLinesUpAction");
  }),
  parseKeysExact(["r", "r"], [1 /* Normal */], (vimState, editor) => {
    yankLine(vimState, editor);
    deleteLine(vimState, editor);
  }),
  parseKeysExact(["R"], [1 /* Normal */], (vimState, editor) => {
    yankToEndOfLine(vimState, editor);
    vscode15.commands.executeCommand("deleteAllRight");
  }),
  parseKeysExact(["s", "s"], [1 /* Normal */], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      return new vscode15.Selection(
        selection.active.with({ character: 0 }),
        lineEnd(editor.document, selection.active)
      );
    });
    enterVisualLineMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),
  parseKeysExact(["S"], [1 /* Normal */], (vimState, editor) => {
    editor.selections = editor.selections.map((selection) => {
      return new vscode15.Selection(
        selection.active,
        lineEnd(editor.document, selection.active)
      );
    });
    enterVisualMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }),
  parseKeysExact(["h"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("deleteLeft");
  }),
  parseKeysExact(["n"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("deleteRight");
  }),
  parseKeysExact(
    ["z", keymaps_default.Motions.MoveUp],
    [1 /* Normal */],
    (vimState, editor) => {
      vscode15.commands.executeCommand("revealLine", {
        lineNumber: editor.selection.active.line,
        at: "top"
      });
    }
  ),
  parseKeysExact(["z", "z"], [1 /* Normal */], (vimState, editor) => {
    vscode15.commands.executeCommand("revealLine", {
      lineNumber: editor.selection.active.line,
      at: "center"
    });
  }),
  parseKeysExact(
    ["z", keymaps_default.Motions.MoveDown],
    [1 /* Normal */],
    (vimState, editor) => {
      vscode15.commands.executeCommand("revealLine", {
        lineNumber: editor.selection.active.line,
        at: "bottom"
      });
    }
  ),
  parseKeysExact([";"], [1 /* Normal */], (vimState, editor) => {
    vimState.semicolonAction(vimState, editor);
  }),
  parseKeysExact([","], [1 /* Normal */], (vimState, editor) => {
    vimState.commaAction(vimState, editor);
  })
];
function makeMultiLineSelection(vimState, editor, lineCount, direction) {
  return editor.selections.map((selection) => {
    if (direction == 0 /* Up */) {
      let endLine = selection.active.line - lineCount + 1;
      const startPos = lineEnd(editor.document, selection.active);
      const endPos = endLine >= 0 ? new vscode15.Position(endLine, 0) : new vscode15.Position(0, 0);
      return new vscode15.Selection(startPos, endPos);
    } else {
      const endLine = selection.active.line + lineCount - 1;
      const startPos = new vscode15.Position(selection.active.line, 0);
      const endPos = endLine < editor.document.lineCount ? new vscode15.Position(
        endLine,
        editor.document.lineAt(endLine).text.length
      ) : lastChar(editor.document);
      return new vscode15.Selection(startPos, endPos);
    }
  });
}
function deleteLines(vimState, editor, lineCount, direction = 1 /* Down */) {
  let selections = editor.selections.map((selection) => {
    if (direction == 0 /* Up */) {
      let endLine = selection.active.line - lineCount;
      if (endLine >= 0) {
        const startPos = lineEnd(
          editor.document,
          selection.active
        );
        const endPos = new vscode15.Position(
          endLine,
          editor.document.lineAt(endLine).text.length
        );
        return new vscode15.Selection(startPos, endPos);
      } else {
        const startPos = selection.active.line + 1 <= editor.document.lineCount ? new vscode15.Position(selection.active.line + 1, 0) : lineEnd(editor.document, selection.active);
        const endPos = new vscode15.Position(0, 0);
        return new vscode15.Selection(startPos, endPos);
      }
    } else {
      let endLine = selection.active.line + lineCount;
      if (endLine <= editor.document.lineCount - 1) {
        const startPos = new vscode15.Position(selection.active.line, 0);
        const endPos = new vscode15.Position(endLine, 0);
        return new vscode15.Selection(startPos, endPos);
      } else {
        const startPos = selection.active.line - 1 >= 0 ? new vscode15.Position(
          selection.active.line - 1,
          editor.document.lineAt(selection.active.line - 1).text.length
        ) : new vscode15.Position(selection.active.line, 0);
        const endPos = lastChar(editor.document);
        return new vscode15.Selection(startPos, endPos);
      }
    }
  });
  editor.edit((builder) => {
    selections.forEach((sel) => builder.replace(sel, ""));
  }).then(() => {
    editor.selections = editor.selections.map((selection) => {
      const character = editor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
      const newPosition = selection.active.with({ character });
      return new vscode15.Selection(newPosition, newPosition);
    });
  });
}
function deleteLine(vimState, editor, direction = 1 /* Down */) {
  deleteLines(vimState, editor, 1, direction);
}
function yankLine(vimState, editor) {
  vimState.registers = {
    contentsList: editor.selections.map((selection) => {
      return editor.document.lineAt(selection.active.line).text;
    }),
    linewise: true
  };
}
function yankToEndOfLine(vimState, editor) {
  vimState.registers = {
    contentsList: editor.selections.map((selection) => {
      return editor.document.lineAt(selection.active.line).text.substring(selection.active.character);
    }),
    linewise: false
  };
}

// src/actions/motions.ts
var vscode18 = __toESM(require("vscode"));

// src/selection_utils.ts
var vscode16 = __toESM(require("vscode"));
function vscodeToVimVisualSelection(document, vscodeSelection) {
  if (vscodeSelection.active.isBefore(vscodeSelection.anchor)) {
    return new vscode16.Selection(
      left(vscodeSelection.anchor),
      vscodeSelection.active
    );
  } else {
    return new vscode16.Selection(
      vscodeSelection.anchor,
      left(vscodeSelection.active)
    );
  }
}
function vimToVscodeVisualSelection(document, vimSelection) {
  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode16.Selection(
      right(document, vimSelection.anchor),
      vimSelection.active
    );
  } else {
    return new vscode16.Selection(
      vimSelection.anchor,
      right(document, vimSelection.active)
    );
  }
}
function vscodeToVimVisualLineSelection(document, vscodeSelection) {
  return new vscode16.Selection(
    vscodeSelection.anchor.with({ character: 0 }),
    vscodeSelection.active.with({ character: 0 })
  );
}
function vimToVscodeVisualLineSelection(document, vimSelection) {
  const anchorLineLength = document.lineAt(vimSelection.anchor.line).text.length;
  const activeLineLength = document.lineAt(vimSelection.active.line).text.length;
  if (vimSelection.active.isBefore(vimSelection.anchor)) {
    return new vscode16.Selection(
      vimSelection.anchor.with({ character: anchorLineLength }),
      vimSelection.active.with({ character: 0 })
    );
  } else {
    return new vscode16.Selection(
      vimSelection.anchor.with({ character: 0 }),
      vimSelection.active.with({ character: activeLineLength })
    );
  }
}

// src/visual_utils.ts
var vscode17 = __toESM(require("vscode"));
function setVisualSelections(editor, originalSelections) {
  editor.selections = editor.selections.map((selection, i) => {
    const originalSelection = originalSelections[i];
    let activePosition = selection.active;
    if (!selection.isReversed && selection.active.character === 0) {
      activePosition = right(editor.document, selection.active);
    }
    if (originalSelection.active.isBefore(originalSelection.anchor) && selection.active.isAfterOrEqual(selection.anchor)) {
      return new vscode17.Selection(
        left(selection.anchor),
        activePosition
      );
    } else if (originalSelection.active.isAfter(originalSelection.anchor) && selection.active.isBeforeOrEqual(selection.anchor)) {
      return new vscode17.Selection(
        right(editor.document, selection.anchor),
        activePosition
      );
    } else {
      return new vscode17.Selection(selection.anchor, activePosition);
    }
  });
}

// src/actions/motions.ts
var motions = [
  parseKeysExact(
    [keymaps_default.Motions.MoveRight],
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return rightNormal(document, position);
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveLeft],
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return left(position);
      });
    }
  ),
  parseKeysExact([keymaps_default.Motions.MoveUp], [1 /* Normal */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "up",
      by: "wrappedLine"
    });
  }),
  parseKeysExact([keymaps_default.Motions.MoveUp], [2 /* Visual */], (vimState, editor) => {
    const originalSelections = editor.selections;
    vscode18.commands.executeCommand("cursorMove", {
      to: "up",
      by: "wrappedLine",
      select: true
    }).then(() => {
      setVisualSelections(editor, originalSelections);
    });
  }),
  parseKeysExact(
    [keymaps_default.Motions.MoveUp],
    [3 /* VisualLine */],
    (vimState, editor) => {
      vscode18.commands.executeCommand("cursorMove", { to: "up", by: "line", select: true }).then(() => {
        setVisualLineSelections(editor);
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveDown],
    [1 /* Normal */],
    (vimState, editor) => {
      vscode18.commands.executeCommand("cursorMove", {
        to: "down",
        by: "wrappedLine"
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveDown],
    [2 /* Visual */],
    (vimState, editor) => {
      const originalSelections = editor.selections;
      vscode18.commands.executeCommand("cursorMove", {
        to: "down",
        by: "wrappedLine",
        select: true
      }).then(() => {
        setVisualSelections(editor, originalSelections);
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveDown],
    [3 /* VisualLine */],
    (vimState, editor) => {
      vscode18.commands.executeCommand("cursorMove", { to: "down", by: "line", select: true }).then(() => {
        setVisualLineSelections(editor);
      });
    }
  ),
  parseKeysExact(
    ["w"],
    [1 /* Normal */, 2 /* Visual */],
    createWordForwardHandler2(wordRanges)
  ),
  parseKeysExact(
    ["W"],
    [1 /* Normal */, 2 /* Visual */],
    createWordForwardHandler2(whitespaceWordRanges)
  ),
  parseKeysExact(
    ["b"],
    [1 /* Normal */, 2 /* Visual */],
    createWordBackwardHandler2(wordRanges)
  ),
  parseKeysExact(
    ["B"],
    [1 /* Normal */, 2 /* Visual */],
    createWordBackwardHandler2(whitespaceWordRanges)
  ),
  parseKeysExact(
    ["e"],
    [1 /* Normal */, 2 /* Visual */],
    createWordEndHandler2(wordRanges)
  ),
  parseKeysExact(
    ["E"],
    [1 /* Normal */, 2 /* Visual */],
    createWordEndHandler2(whitespaceWordRanges)
  ),
  parseKeysRegex(
    /^f(..)$/,
    /^(f|f.)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      findForward(vimState, editor, match);
      vimState.semicolonAction = (innerVimState, innerEditor) => {
        findForward(innerVimState, innerEditor, match);
      };
      vimState.commaAction = (innerVimState, innerEditor) => {
        findBackward(innerVimState, innerEditor, match);
      };
    }
  ),
  parseKeysRegex(
    /^F(..)$/,
    /^(F|F.)$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      findBackward(vimState, editor, match);
      vimState.semicolonAction = (innerVimState, innerEditor) => {
        findBackward(innerVimState, innerEditor, match);
      };
      vimState.commaAction = (innerVimState, innerEditor) => {
        findForward(innerVimState, innerEditor, match);
      };
    }
  ),
  parseKeysRegex(
    /^t(.)$/,
    /^t$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      tillForward(vimState, editor, match);
      vimState.semicolonAction = (innerVimState, innerEditor) => {
        tillForward(innerVimState, innerEditor, match);
      };
      vimState.commaAction = (innerVimState, innerEditor) => {
        tillBackward(innerVimState, innerEditor, match);
      };
    }
  ),
  parseKeysRegex(
    /^T(.)$/,
    /^T$/,
    [1 /* Normal */, 2 /* Visual */],
    (vimState, editor, match) => {
      tillBackward(vimState, editor, match);
      vimState.semicolonAction = (innerVimState, innerEditor) => {
        tillBackward(innerVimState, innerEditor, match);
      };
      vimState.commaAction = (innerVimState, innerEditor) => {
        tillForward(innerVimState, innerEditor, match);
      };
    }
  ),
  parseKeysExact(
    ["g", "g"],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode18.Position(0, 0);
      });
    }
  ),
  parseKeysExact(
    ["G"],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode18.Position(document.lineCount - 1, 0);
      });
    }
  ),
  parseKeysExact(
    ["}"],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode18.Position(
          paragraphForward(document, position.line),
          0
        );
      });
    }
  ),
  parseKeysExact(
    ["{"],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        return new vscode18.Position(
          paragraphBackward(document, position.line),
          0
        );
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveLineEnd],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        const lineLength = document.lineAt(position.line).text.length;
        return position.with({ character: Math.max(lineLength - 1, 0) });
      });
    }
  ),
  parseKeysExact(
    [keymaps_default.Motions.MoveLineStart],
    [1 /* Normal */, 2 /* Visual */, 3 /* VisualLine */],
    (vimState, editor) => {
      execMotion(vimState, editor, ({ document, position }) => {
        const line = document.lineAt(position.line);
        return position.with({
          character: line.firstNonWhitespaceCharacterIndex
        });
      });
    }
  ),
  parseKeysExact(["H"], [1 /* Normal */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortTop",
      by: "line"
    });
  }),
  parseKeysExact(["H"], [2 /* Visual */], (vimState, editor) => {
    const originalSelections = editor.selections;
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortTop",
      by: "line",
      select: true
    }).then(() => {
      setVisualSelections(editor, originalSelections);
    });
  }),
  parseKeysExact(["H"], [3 /* VisualLine */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortTop",
      by: "line",
      select: true
    }).then(() => {
      setVisualLineSelections(editor);
    });
  }),
  parseKeysExact(["M"], [1 /* Normal */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortCenter",
      by: "line"
    });
  }),
  parseKeysExact(["M"], [2 /* Visual */], (vimState, editor) => {
    const originalSelections = editor.selections;
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortCenter",
      by: "line",
      select: true
    }).then(() => {
      setVisualSelections(editor, originalSelections);
    });
  }),
  parseKeysExact(["M"], [3 /* VisualLine */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortCenter",
      by: "line",
      select: true
    }).then(() => {
      setVisualLineSelections(editor);
    });
  }),
  parseKeysExact(["L"], [1 /* Normal */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortBottom",
      by: "line"
    });
  }),
  parseKeysExact(["L"], [2 /* Visual */], (vimState, editor) => {
    const originalSelections = editor.selections;
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortBottom",
      by: "line",
      select: true
    }).then(() => {
      setVisualSelections(editor, originalSelections);
    });
  }),
  parseKeysExact(["L"], [3 /* VisualLine */], (vimState, editor) => {
    vscode18.commands.executeCommand("cursorMove", {
      to: "viewPortBottom",
      by: "line",
      select: true
    }).then(() => {
      setVisualLineSelections(editor);
    });
  })
];
function execRegexMotion(vimState, editor, match, regexMotion) {
  return execMotion(vimState, editor, (motionArgs) => {
    return regexMotion(__spreadProps(__spreadValues({}, motionArgs), {
      match
    }));
  });
}
function execMotion(vimState, editor, motion) {
  const document = editor.document;
  const newSelections = editor.selections.map((selection, i) => {
    if (vimState.mode === 1 /* Normal */) {
      const newPosition = motion({
        document,
        position: selection.active,
        selectionIndex: i,
        vimState
      });
      return new vscode18.Selection(newPosition, newPosition);
    } else if (vimState.mode === 2 /* Visual */) {
      const vimSelection = vscodeToVimVisualSelection(document, selection);
      const motionPosition = motion({
        document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState
      });
      return vimToVscodeVisualSelection(
        document,
        new vscode18.Selection(vimSelection.anchor, motionPosition)
      );
    } else if (vimState.mode === 3 /* VisualLine */) {
      const vimSelection = vscodeToVimVisualLineSelection(document, selection);
      const motionPosition = motion({
        document,
        position: vimSelection.active,
        selectionIndex: i,
        vimState
      });
      return vimToVscodeVisualLineSelection(
        document,
        new vscode18.Selection(vimSelection.anchor, motionPosition)
      );
    } else {
      return selection;
    }
  });
  editor.selections = newSelections;
  editor.revealRange(
    new vscode18.Range(newSelections[0].active, newSelections[0].active),
    vscode18.TextEditorRevealType.InCenterIfOutsideViewport
  );
}
function findForward(vimState, editor, outerMatch) {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const fromPosition = position.with({ character: position.character + 1 });
      const result = searchForward(document, match[1], fromPosition);
      if (result) {
        return result;
      } else {
        return position;
      }
    }
  );
}
function findBackward(vimState, editor, outerMatch) {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const fromPosition = positionLeftWrap(document, position);
      const result = searchBackward(document, match[1], fromPosition);
      if (result) {
        return result;
      } else {
        return position;
      }
    }
  );
}
function tillForward(vimState, editor, outerMatch) {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.indexOf(match[1], position.character + 1);
      if (result >= 0) {
        return position.with({ character: result });
      } else {
        return position;
      }
    }
  );
}
function tillBackward(vimState, editor, outerMatch) {
  execRegexMotion(
    vimState,
    editor,
    outerMatch,
    ({ document, position, match }) => {
      const lineText = document.lineAt(position.line).text;
      const result = lineText.lastIndexOf(match[1], position.character - 1);
      if (result >= 0) {
        return position.with({ character: result });
      } else {
        return position;
      }
    }
  );
}
function positionLeftWrap(document, position) {
  if (position.character === 0) {
    if (position.line === 0) {
      return position;
    } else {
      const lineLength = document.lineAt(position.line - 1).text.length;
      return new vscode18.Position(position.line - 1, lineLength);
    }
  } else {
    return position.with({ character: position.character - 1 });
  }
}
function createWordForwardHandler2(wordRangesFunction) {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);
      const result = ranges.find((x) => x.start > position.character);
      if (result) {
        return position.with({ character: result.start });
      } else {
        return position;
      }
    });
  };
}
function createWordBackwardHandler2(wordRangesFunction) {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);
      const result = ranges.reverse().find((x) => x.start < position.character);
      if (result) {
        return position.with({ character: result.start });
      } else {
        return position;
      }
    });
  };
}
function createWordEndHandler2(wordRangesFunction) {
  return (vimState, editor) => {
    execMotion(vimState, editor, ({ document, position }) => {
      const lineText = document.lineAt(position.line).text;
      const ranges = wordRangesFunction(lineText);
      const result = ranges.find((x) => x.end > position.character);
      if (result) {
        return position.with({ character: result.end });
      } else {
        return position;
      }
    });
  };
}

// src/actions/index.ts
var actions2 = actions.concat(operators, motions);

// src/type_handler.ts
function typeHandler(vimState, char) {
  const editor = vscode19.window.activeTextEditor;
  if (!editor)
    return;
  vimState.keysPressed.push(char);
  try {
    let could = false;
    for (const action of actions2) {
      const result = action(vimState, vimState.keysPressed, editor);
      if (result === 0 /* YES */) {
        vimState.keysPressed = [];
        break;
      } else if (result === 2 /* MORE_INPUT */) {
        could = true;
      }
    }
    if (!could) {
      vimState.keysPressed = [];
    }
  } catch (error) {
    console.error(error);
  }
}

// src/escape_handler.ts
var vscode20 = __toESM(require("vscode"));
function escapeHandler(vimState) {
  const editor = vscode20.window.activeTextEditor;
  if (!editor)
    return;
  if (vimState.mode === 0 /* Insert */ || vimState.mode === 4 /* Occurrence */) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = left(selection.active);
      return new vscode20.Selection(newPosition, newPosition);
    });
    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
    addTypeSubscription(vimState, typeHandler);
  } else if (vimState.mode === 1 /* Normal */) {
    if (editor.selections.length > 1) {
      editor.selections = [editor.selections[0]];
    }
  } else if (vimState.mode === 2 /* Visual */) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = new vscode20.Position(
        selection.active.line,
        Math.max(selection.active.character - 1, 0)
      );
      return new vscode20.Selection(newPosition, newPosition);
    });
    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  } else if (vimState.mode === 3 /* VisualLine */) {
    editor.selections = editor.selections.map((selection) => {
      const newPosition = selection.active.with({
        character: Math.max(selection.active.character - 1, 0)
      });
      return new vscode20.Selection(newPosition, newPosition);
    });
    enterNormalMode(vimState);
    setModeCursorStyle(vimState.mode, editor);
  }
  vimState.keysPressed = [];
}

// src/index.ts
var globalVimState = {
  typeSubscription: void 0,
  mode: 0 /* Insert */,
  keysPressed: [],
  registers: {
    contentsList: [],
    linewise: true
  },
  semicolonAction: () => void 0,
  commaAction: () => void 0,
  lastPutRanges: {
    ranges: [],
    linewise: true
  }
};
function onSelectionChange(vimState, e) {
  if (vimState.mode === 0 /* Insert */)
    return;
  if (e.selections.every((selection) => selection.isEmpty)) {
    if ((vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) && e.kind === vscode21.TextEditorSelectionChangeKind.Mouse) {
      enterNormalMode(vimState);
      setModeCursorStyle(vimState.mode, e.textEditor);
    }
  } else {
    if (vimState.mode === 1 /* Normal */) {
      enterVisualMode(vimState);
      setModeCursorStyle(vimState.mode, e.textEditor);
    }
  }
}
function onDidChangeActiveTextEditor(vimState, editor) {
  if (!editor)
    return;
  if (editor.selections.every((selection) => selection.isEmpty)) {
    if (vimState.mode === 2 /* Visual */ || vimState.mode === 3 /* VisualLine */) {
      enterNormalMode(vimState);
    }
  } else {
    if (vimState.mode === 1 /* Normal */) {
      enterVisualMode(vimState);
    }
  }
  setModeCursorStyle(vimState.mode, editor);
  vimState.keysPressed = [];
}
function activate(context) {
  context.subscriptions.push(
    vscode21.window.onDidChangeActiveTextEditor(
      (editor) => onDidChangeActiveTextEditor(globalVimState, editor)
    ),
    vscode21.window.onDidChangeTextEditorSelection(
      (e) => onSelectionChange(globalVimState, e)
    ),
    vscode21.commands.registerCommand(
      "extension.simpleVim.escapeKey",
      () => escapeHandler(globalVimState)
    ),
    vscode21.commands.registerCommand(
      "extension.simpleVim.scrollDownHalfPage",
      scrollDownHalfPage
    ),
    vscode21.commands.registerCommand(
      "extension.simpleVim.scrollUpHalfPage",
      scrollUpHalfPage
    ),
    vscode21.commands.registerCommand(
      "extension.simpleVim.scrollDownPage",
      scrollDownPage
    ),
    vscode21.commands.registerCommand(
      "extension.simpleVim.scrollUpPage",
      scrollUpPage
    )
  );
  enterNormalMode(globalVimState);
  addTypeSubscription(globalVimState, typeHandler);
  if (vscode21.window.activeTextEditor) {
    onDidChangeActiveTextEditor(globalVimState, vscode21.window.activeTextEditor);
  }
}
function deactivate() {
  removeTypeSubscription(globalVimState);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
