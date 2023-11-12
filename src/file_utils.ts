import { TextEditor, window } from 'vscode'

let currentEditor: TextEditor | undefined
let previousEditor: TextEditor | undefined

export const registerActiveTextEditorChangeListener = () => {
  window.onDidChangeActiveTextEditor((textEditor) => {
    previousEditor = currentEditor
    currentEditor = textEditor
  })
}

export const getPreviousEditor = () => {
  return previousEditor
}

export const getCurrentEditor = () => {
  return currentEditor
}
