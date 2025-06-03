# Helix for VS Code

<div style="display: flex;" align="center">
<img src="./docs/img/helixLogo.png" width=12%>
  &nbsp;
  &nbsp;
<img src="./docs/img/Visual_Studio_Code_1.35_icon.png" width=18%>
</div>
<br />
This is a Visual Studio Code implementation of Helix Keybindings and Commands. I created this because I wanted to use Helix in VS Code and was frustrated with the built-in commands not being ergonomic. I didn't want to move fully unto helix and lose the benefits of VS Code, so I decided to create this extension.

It is a work in progress, feel free to raise issues or contribute on the issue tracker.

## Installation

You can find the extension on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jasew.vscode-helix-emulation).

## Commands

The main commands should work but selections currently do not.

Right now commands are hardcoded to the [default keymap](https://docs.helix-editor.com/keymap.html), hopefully this can be adjusted to the user's keymap in the future.

If something doesn't work, please open an issue.

## Performance

For added performance, you can try adding the following [setting](https://github.com/microsoft/vscode/issues/75627#issuecomment-1078827311), and reload/restart VSCode:

```json
"extensions.experimental.affinity": {
  "jasew.vscode-helix-emulation": 1
}
```

## Differences

There will be some differences between this extension and native Helix, these will be due:

- Both are visually different and offer different features (such as VS Code having multiple windows and tabs rather than buffers)
- VS Code not having TreeSitter or an AST, so we need to find other ways of achieving the same action.
- Additional keybindings to match more how VS Code works

### Window Mode

Due to VS Code having tabs I've needed to add some new windows modes on top of the current Helix ones, these commands are based
around movements, (i.e moving the editor from one window to another).

| Command          | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `ctrl + w, m, v` | Move editor to the next group vertically (to the right) |
| `ctrl + w, m, s` | Move editor to the next group horizontally (below)      |
| `ctrl + w, m, p` | Move editor back to the previous group                  |
| `ctrl + w, m, w` | Move editor out into a new window (experimental)        |
| `ctrl + w, m, j` | Rejoin editor with main window (experimental)           |
| `ctrl + w, c`    | Close window (alias to ctrl + w, q)                     |
| `ctrl + w, n`    | New untitled editor (prev ctrl+n/cmd+n in VS Code)      |
| `ctrl + w, b`    | Toggle sidebar visibility (prev ctrl+b in VS Code)      |

Most of the differences will be related to the fact VSCode doesn't have TreeSitter or have access to an AST. So we often need to find other ways of achieving the same action.

- `mif/maf` both do the same, they will select the outer function range. Getting the inner function body isn't achievable because LSP doesn't give us that, and we can't hardcode blocks (incompatibilty with python for example)

### Movements

| Command   | Description                                   |
| --------- | --------------------------------------------- |
| `alt + k` | Move lines or selection up                    |
| `alt + j` | Move lines or selection down                  |
| `alt + d` | Add selection to next match (same as ctrl+d)  |
| `alt + m` | Move selection to next match (same as ctrl+k) |

### Line Number Toggle

The extension includes a line number toggle feature that automatically switches between relative and absolute line numbers based on the current editor mode:

- **Normal, Visual, and Visual Line modes**: Shows relative line numbers for easier navigation with motions like `10j` or `5k`
- **Insert mode**: Shows absolute line numbers for clearer positioning context

To enable this feature, add the following setting to your VS Code configuration:

```json
"helixKeymap.toggleRelativeLineNumbers": true
```

This behaviour matches Helix's approach to line numbers, helping you take advantage of relative line numbers for efficient movement commands while providing absolute numbers when editing text.

## Outstanding

Feel free to pick up any of these if you wanted to contribute.

- [#3](https://github.com/jasonwilliams/vscode-helix/issues/3) Commit checkpoints, extensions don't have access to VS Code's back/forward stack. So it would need to have its own stack in memory which can be manipulated.
- [#4](https://github.com/jasonwilliams/vscode-helix/issues/4) Custom keymaps, currently keymaps are matching Helix

## Insert Mode

- `ctrl + k` (delete to end of line) needs to be `ctrl + l` instead due to it conflicting with VS Code's chord mode which extensions can't turn off.
