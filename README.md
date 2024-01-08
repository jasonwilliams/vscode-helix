# Helix for VS Code

<div style="display: flex;" align="center">
<img src="./docs/img/helixLogo.png" width=12%>
  &nbsp;
  &nbsp;
<img src="./docs/img/Visual_Studio_Code_1.35_icon.png" width=18%>
</div>
<br />
This is a fork of an older Helix extension which in itself was a fork of the VSCode Vim extension. So there are still a lot of references to Vim in this source code. It is a work in progress.

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

Most of the differences will be related to the fact VSCode doesn't have TreeSitter or have access to an AST. So we often need to find other ways of achieving the same action.

- `mif/maf` both do the same, they will select the outer function range. Getting the inner function body isn't achievable because LSP doesn't give us that, and we can't hardcode blocks (incompatibilty with python for example)

### Movements

| Command   | Description                                   |
| --------- | --------------------------------------------- |
| `alt + k` | Move lines or selection up                    |
| `alt + j` | Move lines or selection down                  |
| `alt + d` | Add selection to next match (same as ctrl+d)  |
| `alt + m` | Move selection to next match (same as ctrl+k) |

## Outstanding

Feel free to pick up any of these if you wanted to contribute.

- [#3](https://github.com/jasonwilliams/vscode-helix/issues/3) Commit checkpoints, extensions don't have access to VS Code's back/forward stack. So it would need to have its own stack in memory which can be manipulated.
- [#4](https://github.com/jasonwilliams/vscode-helix/issues/4) Custom keymaps, currently keymaps are matching Helix
