import * as vscode from 'vscode';
import { Action } from '../action_types';
import { enterInsertMode, setModeCursorStyle } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact, parseKeysRegex } from '../parse_keys';
import { removeTypeSubscription } from '../type_subscription';
import { delete_ } from './operators';

export const matchActions: Action[] = [
  // Implemenent jump to bracket
  parseKeysExact(['m', 'm'], [Mode.Normal], () => {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  }),

  parseKeysExact(['m', 'm'], [Mode.Visual], () => {
    vscode.commands.executeCommand('editor.action.selectToBracket');
  }),

  // Delete match
  parseKeysExact(['d'], [Mode.Normal, Mode.Visual], (_, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    delete_(editor, ranges, false);
  }),

  // edit match
  parseKeysExact(['c'], [Mode.Normal, Mode.Visual], (helixState, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    delete_(editor, ranges, false);
    enterInsertMode(helixState);
    setModeCursorStyle(helixState.mode, editor);
    removeTypeSubscription(helixState);
  }),

  // implement match add to selection
  parseKeysRegex(/^ms(.)$/, /^ms/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    const char = match[1];
    const [startChar, endChar] = getMatchPairs(char);
    // Add char to both ends of each selection
    editor.edit((editBuilder) => {
      // Add char to both ends of each selection
      editor.selections.forEach((selection) => {
        const start = selection.start;
        const end = selection.end;
        editBuilder.insert(start, startChar);
        editBuilder.insert(end, endChar);
      });
    });
  }),

  // implement match replace to selection
  parseKeysRegex(/^mr(.)(.)$/, /^mr?(.)?/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    const original = match[1];
    const replacement = match[2];
    const [startCharOrig, endCharOrig] = getMatchPairs(original);
    const [startCharNew, endCharNew] = getMatchPairs(replacement);
    const num = helixState.resolveCount();

    const forwardPosition = searchFowardForChar(endCharOrig, editor.selection.active, num);
    const backwardPosition = searchBackwardForChar(startCharOrig, editor.selection.active, num);

    if (forwardPosition === undefined || backwardPosition === undefined) return;

    // Add char to both ends of each selection
    editor.edit((editBuilder) => {
      // Add char to both ends of each selection
      editBuilder.replace(
        new vscode.Range(forwardPosition, forwardPosition.with({ character: forwardPosition.character + 1 })),
        endCharNew,
      );
      editBuilder.replace(
        new vscode.Range(backwardPosition, backwardPosition.with({ character: backwardPosition.character + 1 })),
        startCharNew,
      );
    });
  }),

  // implement match delete character
  parseKeysRegex(/^md(.)$/, /^md?/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    const char = match[1];
    const [startChar, endChar] = getMatchPairs(char);
    const num = helixState.resolveCount();

    const forwardPosition = searchFowardForChar(endChar, editor.selection.active, num);
    const backwardPosition = searchBackwardForChar(startChar, editor.selection.active, num);

    if (forwardPosition === undefined || backwardPosition === undefined) return;

    // Add char to both ends of each selection
    editor.edit((editBuilder) => {
      // Add char to both ends of each selection
      editBuilder.delete(
        new vscode.Range(forwardPosition, forwardPosition.with({ character: forwardPosition.character + 1 })),
      );
      editBuilder.delete(
        new vscode.Range(backwardPosition, backwardPosition.with({ character: backwardPosition.character + 1 })),
      );
    });
  }),
];

const searchFowardForChar = (char: string, fromPosition: vscode.Position, num: number): vscode.Position | undefined => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const document = editor.document;
  // num starts at 1 so we should drop down to 0, as 1 is the default
  // even if count wasn't specified
  let count = --num;

  for (let i = fromPosition.line; i < document.lineCount; ++i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : 0;

    for (let j = fromIndex; j < lineText.length; ++j) {
      if (lineText[j] === char && count === 0) {
        return new vscode.Position(i, j);
      } else if (lineText[j] === char) {
        --count;
      }
    }
  }

  return undefined;
};

const searchBackwardForChar = (
  char: string,
  fromPosition: vscode.Position,
  num: number,
): vscode.Position | undefined => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const document = editor.document;
  // num starts at 1 so we should drop down to 0, as 1 is the default
  // even if count wasn't specified
  let count = --num;

  for (let i = fromPosition.line; i >= 0; --i) {
    const lineText = document.lineAt(i).text;
    const fromIndex = i === fromPosition.line ? fromPosition.character : lineText.length - 1;

    for (let j = fromIndex; j >= 0; --j) {
      if (lineText[j] === char && count === 0) {
        return new vscode.Position(i, j);
      } else if (lineText[j] === char) {
        --count;
      }
    }
  }

  return undefined;
};

const getMatchPairs = (char: string) => {
  let startChar: string;
  let endChar: string;
  if (['{', '}'].includes(char)) {
    startChar = '{';
    endChar = '}';
  } else if (['[', ']'].includes(char)) {
    startChar = '[';
    endChar = ']';
  } else if (['(', ')'].includes(char)) {
    startChar = '(';
    endChar = ')';
  } else if (['<', '>'].includes(char)) {
    startChar = '<';
    endChar = '>';
  } else {
    // Otherwise, startChar and endChar should be the same character
    startChar = char;
    endChar = char;
  }

  return [startChar, endChar];
};
