import * as vscode from 'vscode';

export class SymbolProvider {
  /** The array of symbols in the current document */
  tree: vscode.DocumentSymbol[] = [];
  /** Current index in tree */
  symbolIndex = 0;
  /** Flag for if the tree is dirty or not */
  dirtyTree = false;

  static checkSymbolKindPermitted(symbolKind: vscode.SymbolKind): boolean {
    // https://code.visualstudio.com/api/references/vscode-api#SymbolKind
    return (
      symbolKind === vscode.SymbolKind.Class ||
      symbolKind === vscode.SymbolKind.Constructor ||
      symbolKind === vscode.SymbolKind.Enum ||
      symbolKind === vscode.SymbolKind.EnumMember ||
      symbolKind === vscode.SymbolKind.Event ||
      symbolKind === vscode.SymbolKind.Function ||
      symbolKind === vscode.SymbolKind.Interface ||
      symbolKind === vscode.SymbolKind.Method ||
      symbolKind === vscode.SymbolKind.Module ||
      symbolKind === vscode.SymbolKind.Object
    );
  }

  async refreshTree(uri: vscode.Uri) {
    const results = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    );
    if (!results) {
      return [];
    }

    const flattenedSymbols: vscode.DocumentSymbol[] = [];
    const addSymbols = (flattenedSymbols: vscode.DocumentSymbol[], results: vscode.DocumentSymbol[]) => {
      results.forEach((symbol: vscode.DocumentSymbol) => {
        if (SymbolProvider.checkSymbolKindPermitted(symbol.kind)) {
          flattenedSymbols.push(symbol);
        }
        if (symbol.children && symbol.children.length > 0) {
          addSymbols(flattenedSymbols, symbol.children);
        }
      });
    };

    addSymbols(flattenedSymbols, results);

    this.tree = flattenedSymbols.sort((x: vscode.DocumentSymbol, y: vscode.DocumentSymbol) => {
      const lineDiff = x.selectionRange.start.line - y.selectionRange.start.line;
      if (lineDiff === 0) {
        return x.selectionRange.start.character - y.selectionRange.start.character;
      }
      return lineDiff;
    });

    this.dirtyTree = false;
  }

  setSymbolIndex(cursorLine: number, cursorCharacter: number, directionNext: boolean, prevSymbolIndex: number) {
    let member;

    if (directionNext) {
      this.symbolIndex = -1;
      do {
        this.symbolIndex++;
        member = this.tree[this.symbolIndex].selectionRange.start;
      } while (
        (member.line < cursorLine ||
          (member.line === cursorLine && member.character <= cursorCharacter) ||
          this.symbolIndex === prevSymbolIndex) &&
        this.symbolIndex < this.tree.length - 1
      );
    } else {
      this.symbolIndex = this.tree.length;
      do {
        this.symbolIndex--;
        member = this.tree[this.symbolIndex].selectionRange.start;
      } while (
        (member.line > cursorLine ||
          (member.line === cursorLine && member.character >= cursorCharacter) ||
          this.symbolIndex === prevSymbolIndex) &&
        this.symbolIndex > 0
      );
    }
  }

  previousMemberRange(editor: vscode.TextEditor): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const activeCursor = editor.selection.active;
    this.setSymbolIndex(activeCursor.line, activeCursor.character, false, this.symbolIndex);
    const symbol = this.tree[this.symbolIndex];

    if (symbol) {
      return symbol.range;
    }
  }

  previousNextRange(editor: vscode.TextEditor): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const activeCursor = editor.selection.active;
    this.setSymbolIndex(activeCursor.line, activeCursor.character, true, this.symbolIndex);
    const symbol = this.tree[this.symbolIndex];

    if (symbol) {
      return symbol.range;
    }
  }

  getContainingSymbolRange(position: vscode.Position): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const symbol = this.tree.find((symbol: vscode.DocumentSymbol) => {
      return symbol.range.contains(position);
    });

    if (symbol) {
      return symbol.range;
    }
  }
}

export const symbolProvider = new SymbolProvider();
