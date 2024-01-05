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
      symbolKind === vscode.SymbolKind.Constructor ||
      symbolKind === vscode.SymbolKind.Enum ||
      symbolKind === vscode.SymbolKind.EnumMember ||
      symbolKind === vscode.SymbolKind.Event ||
      symbolKind === vscode.SymbolKind.Function ||
      symbolKind === vscode.SymbolKind.Interface ||
      symbolKind === vscode.SymbolKind.Method
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

  getContainingSymbolIndex(position: vscode.Position): number | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const symbolIndex = this.tree.findIndex((symbol: vscode.DocumentSymbol) => {
      return symbol.range.contains(position);
    });

    return symbolIndex;
  }

  getContainingSymbolRange(position: vscode.Position): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const symbolIndex = this.getContainingSymbolIndex(position);
    if (symbolIndex === -1 || symbolIndex === undefined) {
      return;
    }

    const symbol = this.tree[symbolIndex];

    if (symbol) {
      return symbol.range;
    }
  }

  getNextFunctionRange(editor: vscode.TextEditor): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const activeCursor = editor.selection.active;
    const currentSymbolIndex = this.getContainingSymbolIndex(activeCursor);
    if (currentSymbolIndex === undefined) {
      return;
    }

    // Iterate forward until we find the next function on the same level
    for (let i = currentSymbolIndex + 1; i < this.tree.length; i++) {
      if (this.tree[i].kind === vscode.SymbolKind.Function) {
        this.symbolIndex = i;
        break;
      }
    }

    const symbol = this.tree[this.symbolIndex];
    if (symbol) {
      return symbol.range;
    }
  }

  getPreviousFunctionRange(editor: vscode.TextEditor): vscode.Range | undefined {
    if (this.tree.length === 0 || this.dirtyTree) {
      return;
    }

    const activeCursor = editor.selection.active;
    const currentSymbolIndex = this.getContainingSymbolIndex(activeCursor);
    if (currentSymbolIndex === undefined) {
      return;
    }

    // Iterate backwards until we find the previouis function on the same level
    for (let i = currentSymbolIndex - 1; i > 0; i--) {
      if (this.tree[i].kind === vscode.SymbolKind.Function) {
        this.symbolIndex = i;
        break;
      }
    }

    const symbol = this.tree[this.symbolIndex];
    if (symbol) {
      return symbol.range;
    }
  }
}

export const symbolProvider = new SymbolProvider();
