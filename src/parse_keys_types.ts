import * as vscode from "vscode";

import { VimState } from "./vim_state_types";

export enum ParseKeysStatus {
  YES,
  NO,
  MORE_INPUT
}

export type ParseFailure = {
  kind: "failure";
  status: ParseKeysStatus;
};

export type ParseOperatorPartSuccess = {
  kind: "success";
  rest: string[];
};

export type ParseOperatorRangeSuccess = {
  kind: "success";
  ranges: (vscode.Range | undefined)[];
  linewise: boolean;
};

export type ParseOperatorSuccess = {
  kind: "success";
  motion: OperatorRange | undefined;
};

export type OperatorRange = (
  vimState: VimState,
  keys: string[],
  editor: vscode.TextEditor
) => ParseFailure | ParseOperatorRangeSuccess;
