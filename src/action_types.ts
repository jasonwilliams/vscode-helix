import * as vscode from "vscode";

import { VimState } from "./vim_state_types";
import { ParseKeysStatus } from "./parse_keys_types";

export type Action = (
  vimState: VimState,
  keys: string[],
  editor: vscode.TextEditor
) => ParseKeysStatus;
