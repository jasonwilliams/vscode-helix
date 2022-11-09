import * as vscode from "vscode";

import { VimState } from "./vim_state_types";
import { Mode } from "./modes_types";
import {
  ParseKeysStatus,
  OperatorRange,
  ParseFailure,
  ParseOperatorPartSuccess,
  ParseOperatorRangeSuccess
} from "./parse_keys_types";
import { Action } from "./action_types";

export function arrayStartsWith<T>(prefix: T[], xs: T[]) {
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

export function arrayEquals<T>(xs: T[], ys: T[]) {
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

export function parseKeysExact(
  matchKeys: string[],
  modes: Mode[],
  action: (vimState: VimState, editor: vscode.TextEditor) => void
): Action {
  return (vimState, keys, editor) => {
    if (modes && modes.indexOf(vimState.mode) < 0) {
      return ParseKeysStatus.NO;
    }

    if (arrayEquals(keys, matchKeys)) {
      action(vimState, editor);
      return ParseKeysStatus.YES;
    } else if (arrayStartsWith(keys, matchKeys)) {
      return ParseKeysStatus.MORE_INPUT;
    } else {
      return ParseKeysStatus.NO;
    }
  };
}

export function parseKeysRegex(
  doesPattern: RegExp,
  couldPattern: RegExp,
  modes: Mode[],
  action: (
    vimState: VimState,
    editor: vscode.TextEditor,
    match: RegExpMatchArray
  ) => void
): Action {
  return (vimState, keys, editor) => {
    if (modes && modes.indexOf(vimState.mode) < 0) {
      return ParseKeysStatus.NO;
    }

    const keysStr = keys.join("");
    const doesMatch = keysStr.match(doesPattern);

    if (doesMatch) {
      action(vimState, editor, doesMatch);
      return ParseKeysStatus.YES;
    } else if (keysStr.match(couldPattern)) {
      return ParseKeysStatus.MORE_INPUT;
    } else {
      return ParseKeysStatus.NO;
    }
  };
}

function parseOperatorPart(
  keys: string[],
  operatorKeys: string[]
): ParseFailure | ParseOperatorPartSuccess {
  if (arrayStartsWith(operatorKeys, keys)) {
    return {
      kind: "success",
      rest: keys.slice(operatorKeys.length)
    };
  } else if (arrayStartsWith(keys, operatorKeys)) {
    return {
      kind: "failure",
      status: ParseKeysStatus.MORE_INPUT
    };
  } else {
    return {
      kind: "failure",
      status: ParseKeysStatus.NO
    };
  }
}

function parseOperatorRangePart(
  vimState: VimState,
  keys: string[],
  editor: vscode.TextEditor,
  motions: OperatorRange[]
): ParseFailure | ParseOperatorRangeSuccess {
  let could = false;
  for (const motion of motions) {
    const result = motion(vimState, keys, editor);

    if (result.kind === "success") {
      return result;
    } else if (result.status === ParseKeysStatus.MORE_INPUT) {
      could = true;
    }
  }

  if (could) {
    return {
      kind: "failure",
      status: ParseKeysStatus.MORE_INPUT
    };
  } else {
    return {
      kind: "failure",
      status: ParseKeysStatus.NO
    };
  }
}

export function parseKeysOperator(
  operatorKeys: string[],
  motions: OperatorRange[],
  operator: (
    vimState: VimState,
    editor: vscode.TextEditor,
    ranges: (vscode.Range | undefined)[],
    linewise: boolean
  ) => void
): Action {
  return (vimState, keys, editor) => {
    const operatorResult = parseOperatorPart(keys, operatorKeys);
    if (operatorResult.kind === "failure") {
      return operatorResult.status;
    }

    let ranges: (vscode.Range | undefined)[];
    let linewise = true;
    if (vimState.mode === Mode.Normal) {
      if (operatorResult.rest.length === 0) {
        return ParseKeysStatus.MORE_INPUT;
      }

      const motionResult = parseOperatorRangePart(
        vimState,
        operatorResult.rest,
        editor,
        motions
      );
      if (motionResult.kind === "failure") {
        return motionResult.status;
      }

      ranges = motionResult.ranges;
      linewise = motionResult.linewise;
    } else if (vimState.mode === Mode.VisualLine) {
      ranges = editor.selections;
      linewise = true;
    } else {
      ranges = editor.selections;
      linewise = false;
    }

    operator(vimState, editor, ranges, linewise);
    return ParseKeysStatus.YES;
  };
}

export function createOperatorRangeExactKeys(
  matchKeys: string[],
  linewise: boolean,
  f: (
    vimState: VimState,
    document: vscode.TextDocument,
    position: vscode.Position
  ) => vscode.Range | undefined
): OperatorRange {
  return (vimState, keys, editor) => {
    if (arrayEquals(keys, matchKeys)) {
      const ranges = editor.selections.map(selection => {
        return f(vimState, editor.document, selection.active);
      });
      return {
        kind: "success",
        ranges: ranges,
        linewise: linewise
      };
    } else if (arrayStartsWith(keys, matchKeys)) {
      return {
        kind: "failure",
        status: ParseKeysStatus.MORE_INPUT
      };
    } else {
      return {
        kind: "failure",
        status: ParseKeysStatus.NO
      };
    }
  };
}

export function createOperatorRangeRegex(
  doesPattern: RegExp,
  couldPattern: RegExp,
  linewise: boolean,
  f: (
    vimState: VimState,
    document: vscode.TextDocument,
    position: vscode.Position,
    match: RegExpMatchArray
  ) => vscode.Range | undefined
): OperatorRange {
  return (vimState, keys, editor) => {
    const keysStr = keys.join("");
    const doesMatch = keysStr.match(doesPattern);

    if (doesMatch) {
      const ranges = editor.selections.map(selection => {
        return f(vimState, editor.document, selection.active, doesMatch);
      });
      return {
        kind: "success",
        ranges: ranges,
        linewise: linewise
      };
    } else if (keysStr.match(couldPattern)) {
      return {
        kind: "failure",
        status: ParseKeysStatus.MORE_INPUT
      };
    } else {
      return {
        kind: "failure",
        status: ParseKeysStatus.NO
      };
    }
  };
}
