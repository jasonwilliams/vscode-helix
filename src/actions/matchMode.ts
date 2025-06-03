import * as vscode from 'vscode';
import { Action } from '../action_types';
import { enterInsertMode, setModeCursorStyle, setRelativeLineNumbers } from '../modes';
import { Mode } from '../modes_types';
import { parseKeysExact, parseKeysRegex } from '../parse_keys';
import { searchBackwardBracket, searchForwardBracket } from '../search_utils';
import { removeTypeSubscription } from '../type_subscription';
import { delete_, yank } from './operators';

export const matchActions: Action[] = [
  // Implemenent jump to bracket
  parseKeysExact(['m', 'm'], [Mode.Normal], () => {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  }),

  parseKeysExact(['m', 'm'], [Mode.Visual], () => {
    vscode.commands.executeCommand('editor.action.selectToBracket');
  }),

  // Delete match
  parseKeysExact(['d'], [Mode.Normal, Mode.Visual], (helixState, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    yank(helixState, editor, ranges, false);
    delete_(editor, ranges, false);
  }),

  // edit match
  parseKeysExact(['c'], [Mode.Normal, Mode.Visual], (helixState, editor) => {
    const ranges = editor.selections.map((selection) => selection.with());
    delete_(editor, ranges, false);
    enterInsertMode(helixState);
    setModeCursorStyle(helixState.mode, editor);
    setRelativeLineNumbers(helixState.mode, editor);
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
  parseKeysRegex(/^mr(.)(.)$/, /^mr(.)?/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    const original = match[1];
    const replacement = match[2];
    const [startCharOrig, endCharOrig] = getMatchPairs(original);
    const [startCharNew, endCharNew] = getMatchPairs(replacement);
    const num = helixState.resolveCount();

    const forwardPosition = searchForwardBracket(
      editor.document,
      startCharOrig,
      endCharOrig,
      editor.selection.active,
      num,
    );
    const backwardPosition = searchBackwardBracket(
      editor.document,
      startCharOrig,
      endCharOrig,
      editor.selection.active,
      num,
    );

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
  parseKeysRegex(/^md(.)$/, /^md/, [Mode.Normal, Mode.Visual], (helixState, editor, match) => {
    const char = match[1];
    const [startChar, endChar] = getMatchPairs(char);
    const num = helixState.resolveCount();

    const forwardPosition = searchForwardBracket(editor.document, startChar, endChar, editor.selection.active, num);
    const backwardPosition = searchBackwardBracket(editor.document, startChar, endChar, editor.selection.active, num);

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
