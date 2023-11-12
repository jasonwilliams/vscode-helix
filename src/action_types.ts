import * as vscode from 'vscode';

import { HelixState } from './helix_state_types';
import { ParseKeysStatus } from './parse_keys_types';

export type Action = (vimState: HelixState, keys: string[], editor: vscode.TextEditor) => ParseKeysStatus;
