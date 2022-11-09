# SimpleVim

An opinionated Vim-like extension for VSCode that prioritizes simplicity (of use and implementation) and integration with native VSCode features.

Once you enter Insert mode it will be a completely vanilla VSCode experience: the only event SimpleVim will listen for is the `Escape` key to go back to Normal mode.

## Operators

Operators act on a range of text. In Normal mode the range is specified by the OperatorRange typed after the operator. In Visual mode it is the visual selection.

| Keys | Description |
|-|-|
| `d` | Delete range. |
| `c` | Delete range and enter insert mode. |
| `y` | Yank range. |
| `r` | Yank and delete range. |
| `s` | Select range and enter Visual mode. |
| `q` | Duplicate line. |

## OperatorRanges

OperatorRanges select a range for an Operator to act on. They must be used in Normal mode by typing an Operator and then an OperatorRange.

| Keys | Description |
|-|-|
| `l` | Character under cursor. |
| `j` | Character to the left of cursor. |
| `i` | Current line and line above. |
| `k` | Current line and line below. |
| `w` | From cursor to beginning of next word. |
| `W` | From cursor to beginning of next word (including punctuation). |
| `b` | From cursor to beginning of previous word. |
| `B` | From cursor to beginning of previous word (including punctuation). |
| `e` | From cursor to end of next word. |
| `E` | From cursor to end of next word (including punctuation). |
| `iw` | Word under cursor. |
| `iW` | Word (including punctuation) under cursor. |
| `aw` | Word under cursor and whitespace after. |
| `aW` | Word (including punctuation) under cursor and whitespace after. |
| `f[char][char]` | From cursor to next occurrence (case sensitive) of [char][char]. |
| `F[char][char]` | From cursor to previous occurrence (case sensitive) of [char][char]. |
| `t[char]` | From cursor to next occurrence (case sensitive) of [char]. |
| `T[char]` | From cursor to previous occurrence (case sensitive) of [char]. |
| `gg` | From current line to first line of the document. |
| `G` | From current line to last line of the document. |
| `}` | From current line to beginning of next paragraph. |
| `{` | From current line to beginning of previous paragraph. |
| `ip` | Current paragraph. |
| `ap` | Current paragraph and whitespace after. |
| `i[bracket]` | Inside the matching `[bracket]`s. Where `[bracket]` is a quote or opening bracket character (any of ``'"`({[<``).  |
| `a[bracket]` | Outside the matching `[bracket]`s. Where `[bracket]` is a quote or opening bracket character (any of ``'"`({[<``). |
| `it` | Inside XML tag. |
| `at` | Outside XML tag. |
| `ii` | Inside indentation level. |
| `[number]i` | Including [number] of lines up. |
| `[number]k` | Including [number] of lines down. |


## Motions

Motions move the cursor and can be used in Normal or Visual mode. In Visual mode they only move one side of the selection; the other side stays anchored to where it was when you entered Visual mode.

| Keys | Description |
|-|-|
| `l` | Character right. |
| `j` | Character left. |
| `i` | Line up. |
| `k` | Line down. |
| `w` | Word right. |
| `W` | Word (including punctuation) right. |
| `b` | Word left. |
| `B` | Word (including punctuation) left. |
| `e` | Word end right. |
| `E` | Word end (including punctuation) right. |
| `o` | End of line. |
| `u` | Beginning of line. |
| `%` | Go to matching `[bracket]`. Where `[bracket]` is a bracket character (any of ({[<>]})). |
| `f[char][char]` | Next occurrence (case sensitive) of [char][char]. |
| `F[char][char]` | Previous occurrence (case sensitive) of [char][char]. |
| `t[char]` | Next occurrence (case sensitive) of [char]. |
| `T[char]` | Previous occurrence (case sensitive) of [char]. |
| `gg` | First line of the document. |
| `G` | Last line of the document. |
| `}` | Down a paragraph. |
| `{` | Up a paragraph. |
| `H` | Top of screen. |
| `M` | Middle of screen. |
| `L` | Bottom of screen. |


## Actions

Actions are miscellaneous commands that don't follow the well-defined patterns of Operators, OperatorRanges, or Motions.

| Keys | Description |
|-|-|
| `~` | Enter Insert mode. |
| `U` | Move to beginning of line and enter Insert mode. |
| `a` | Move one character to the right and enter Insert mode. |
| `O` | Move to end of line and enter Insert mode. |
| `v` | Enter VisualCharacter mode. |
| `V` | Enter VisualLine mode. |
| `Escape` | Enter Normal mode. |
| `K` | Insert line below and enter insert mode. |
| `I` | Insert line above and enter insert mode. |
| `p` | Put yanked text before cursor. |
| `P` | Put yanked text after cursor. |
| `gl` | Go to last edited location. |
| `gd` | Go to definition of symbol under cursor in current pane. |
| `gp` | Peek definition of symbol under cursor. |
| `gD` | Go to definition of symbol under cursor in new pane. |
| `gr` | Peek references of symbol under cursor. |
| `gR` | Show all references of symbol under cursor in sidebar. |
| `gh` | Show hover popup of symbol under cursor. |
| `gs` | Open Dash to lookup symbol under cursor (required Dash extension). |
| `gu` | Transform symbol under cursor to lowercase. |
| `gU` | Transform symbol under cursor to uppercase. |
| `n` | Delete character under cursor. |
| `h` | Delete character left of cursor. |
| `dd` | Delete current line. |
| `D` | Delete to the end of the line. |
| `cc` | Delete current line and enter Insert mode. |
| `C` | Delete to the end of the line and enter Insert mode. |
| `yy` | Yank current line. |
| `Y` | Yank to the end of the line. |
| `rr` | Yank current line and delete it. |
| `R` | Yank to the end of the line and delete it. |
| `ss` | Select current line. |
| `S` | Select to the end of the line. |
| `qq` | Copy line down. |
| `QQ` | Copy line up. |
| `[space]z` | Undo. |
| `[space]r` | Redo. |
| `[space]i` | Scroll half-page up. |
| `[space]k` | Scroll half-page down. |
| `x[char]` | Swap character under the cursor with next [char] typed. |
| `zz` | Scroll so that cursor is in the middle of the screen. |
| `:` | Goto line # |
| `;` | Repeat the last `f`, `F`, `t` or `T` motion forward. |
| `,` | Repeat the last `f`, `F`, `t` or `T` motion backward. |


## Occurance Match Mode

Occurance Match Mode lets you easily add cursors to the symbol your cursor is under.

| Keys | Description |
|-|-|
| `[space][space]` | Enter occurance match mode. |
| `p` | Add cursor to to previous match. |
| `n` | Add cursor to to next match. |
| `a` | Add cursor to to all matches in document. |


## Bookmarks

Bookmarks are quick ways to jump to places in code. This requires `alefragnani.bookmarks` extension installed.

| Keys | Description |
|-|-|
| `mm` | Add bookmark to currnet line. |
| `mi` | Move to previous bookmark. |
| `mk` | Move to next bookmark. |
| `ml` | List bookmarks in current file. |
| `mL` | List bookmarks in all files. |


## Differences From Vim

SimpleVim prioritizes simplicity and integration with native VSCode features over compatability with Vim. If full Vim compatibility is important to you, consider trying a different extension. Here are some of the ways SimpleVim is different from Vim.

- SimpleVim has no macros. Instead it has first class multiple cursor support which you can use to achieve something similar. You can place additional cursors by any of the ways native to VSCode including: `Cmd+d`, `Cmd+Alt+Down` or `Alt+Click`. Simply place cursors everywhere you would have run the macro and see your changes to each place in real time.

- SimpleVim has no `.` (repeat) command. Use multiple cursors instead (see previous bullet).

- SimpleVim lets the cursor go one past the last character of the line in Normal mode. It would be nice to prevent this, but because of VSCode's selection model and extension API there is no good way to do it. It would require ugly hacks and would make other parts of the SimpleVim experience buggy.

- SimpleVim has no registers. Instead the operators have been modified so deleting text does not overwrite the text you yanked. A new `r` operator has been added for when you want to yank and delete text at the same time.

- SimpleVim's `f` and `t` motions work slightly differently from Vim's. `t` and `f` behave like Vim's `/` command, but `t` takes one character and `f` takes two. Or in other words, `t` works like Vim's `t` in Normal mode but Vim's `f` in Visual mode. And `f` behaves like the vim-sneak plugin.

- SimpleVim has no `/` (search) command. Instead you can either use the `f` motion or the native VSCode find. Between them most of the uses for `/` are taken care of.

- SimpleVim has no `]` (indent) command. Instead you can use VSCode's `Cmd+]`.

- SimpleVim has no `gU` (uppercase) command. Instead you can use VSCode's `Transform to Uppercase` from the Command Palette.

- SimpleVim has no jump list (`Ctrl+o` and `Ctrl+i` in Vim). Instead you can use VSCode's native jump list with `Ctrl+-` and `Ctrl+_`.

- SimpleVim does not support marks. If you're jumping back and forth often between two places in a file you can use VSCode's split window feature, and use `Cmd+1` and `Cmd+2` to focus them. If you just need to jump back to where you've been, you can use VSCode's `Ctrl+-`.


## Settings

The `y` (yank) operator temporarily changes the background color of the range being yanked to make it obvious what you're yanking. Otherwise you might not realize you yanked the wrong thing until you tried to put it somewhere else. You can change the background color it uses with the `simpleVim.yankHighlightBackgroundColor` setting.

```json
{
    "simpleVim.yankHighlightBackgroundColor": "#F8F3AB"
}
```
