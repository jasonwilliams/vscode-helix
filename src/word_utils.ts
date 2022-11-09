const NON_WORD_CHARACTERS = "/\\()\"':,.;<>~!@#$%^&*|+=[]{}`?-";

export function whitespaceWordRanges(
  text: string
): { start: number; end: number }[] {
  enum State {
    Whitespace,
    Word
  }

  let state = State.Whitespace;
  let startIndex = 0;
  const ranges = [];

  for (let i = 0; i < text.length; ++i) {
    const char = text[i];

    if (state === State.Whitespace) {
      if (!isWhitespaceCharacter(char)) {
        startIndex = i;
        state = State.Word;
      }
    } else {
      if (isWhitespaceCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });

        state = State.Whitespace;
      }
    }
  }

  if (state === State.Word) {
    ranges.push({
      start: startIndex,
      end: text.length - 1
    });
  }

  return ranges;
}

export function wordRanges(text: string): { start: number; end: number }[] {
  enum State {
    Whitespace,
    Word,
    NonWord
  }

  let state = State.Whitespace;
  let startIndex = 0;
  const ranges = [];

  for (let i = 0; i < text.length; ++i) {
    const char = text[i];

    if (state === State.Whitespace) {
      if (!isWhitespaceCharacter(char)) {
        startIndex = i;
        state = isWordCharacter(char) ? State.Word : State.NonWord;
      }
    } else if (state === State.Word) {
      if (!isWordCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });

        if (isWhitespaceCharacter(char)) {
          state = State.Whitespace;
        } else {
          state = State.NonWord;
          startIndex = i;
        }
      }
    } else {
      if (!isNonWordCharacter(char)) {
        ranges.push({
          start: startIndex,
          end: i - 1
        });

        if (isWhitespaceCharacter(char)) {
          state = State.Whitespace;
        } else {
          state = State.Word;
          startIndex = i;
        }
      }
    }
  }

  if (state !== State.Whitespace) {
    ranges.push({
      start: startIndex,
      end: text.length - 1
    });
  }

  return ranges;
}

function isNonWordCharacter(char: string): boolean {
  return NON_WORD_CHARACTERS.indexOf(char) >= 0;
}

function isWhitespaceCharacter(char: string): boolean {
  return char === " " || char === "\t";
}

function isWordCharacter(char: string): boolean {
  return !isWhitespaceCharacter(char) && !isNonWordCharacter(char);
}
