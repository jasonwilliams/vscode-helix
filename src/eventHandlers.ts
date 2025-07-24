import type { TextDocumentChangeEvent, TextEditor, TextEditorSelectionChangeEvent } from 'vscode';
import { TextEditorSelectionChangeKind } from 'vscode';
import { HelixState } from './helix_state_types';
import { enterNormalMode, enterVisualMode, setModeCursorStyle, setRelativeLineNumbers } from './modes';
import { Mode } from './modes_types';

/** Currently this handler is used for implementing "g", "m" (go to last modified file) */
export function onDidChangeTextDocument(HelixState: HelixState, e: TextDocumentChangeEvent) {
  HelixState.editorState.lastModifiedDocument = e.document;
  HelixState.symbolProvider.refreshTree(e.document.uri);
}

/** Currently this handler is used for implementing "g", "a" (go to last accessed file) */
export function onDidChangeActiveTextEditor(helixState: HelixState, editor: TextEditor | undefined) {
  if (!editor) return;

  // The user has switched editors, re-set the editor state so we can go back
  helixState.editorState.previousEditor = helixState.editorState.activeEditor;
  helixState.editorState.activeEditor = editor;
  helixState.symbolProvider.refreshTree(editor.document.uri);

  // Ensure new editors always have the correct cursor style and line numbering
  // applied according to the current mode
  setModeCursorStyle(helixState.mode, editor);
}

export function onSelectionChange(helixState: HelixState, e: TextEditorSelectionChangeEvent): void {
  if (helixState.mode === Mode.Insert) return;

  if (e.selections.every((selection) => selection.isEmpty)) {
    // It would be nice if we could always go from visual to normal mode when all selections are empty
    // but visual mode on an empty line will yield an empty selection and there's no good way of
    // distinguishing that case from the rest. So we only do it for mouse events.
    if (
      (helixState.mode === Mode.Visual || helixState.mode === Mode.VisualLine) &&
      e.kind === TextEditorSelectionChangeKind.Mouse
    ) {
      enterNormalMode(helixState);
      setModeCursorStyle(helixState.mode, e.textEditor);
      setRelativeLineNumbers(helixState.mode, e.textEditor);
    }
  } else {
    if (helixState.mode === Mode.Normal) {
      enterVisualMode(helixState);
      // setModeCursorStyle(helixState.mode, e.textEditor);
    }
  }
}
