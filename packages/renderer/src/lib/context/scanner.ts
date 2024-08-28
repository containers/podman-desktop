/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// based on https://github.com/microsoft/vscode/blob/3eed9319874b7ca037128962593b6a8630869253/src/vs/platform/contextkey/common/scanner.ts

import { CharCode } from '../../../../main/src/plugin/util/charCode';

export const enum TokenType {
  LParen,
  RParen,
  Neg,
  Eq,
  NotEq,
  Lt,
  LtEq,
  Gt,
  GtEq,
  RegexOp,
  RegexStr,
  True,
  False,
  In,
  Not,
  And,
  Or,
  Str,
  QuotedStr,
  Error,
  EOF,
}

export type Token =
  | { type: TokenType.LParen; offset: number }
  | { type: TokenType.RParen; offset: number }
  | { type: TokenType.Neg; offset: number }
  | { type: TokenType.Eq; offset: number; isTripleEq: boolean }
  | { type: TokenType.NotEq; offset: number; isTripleEq: boolean }
  | { type: TokenType.Lt; offset: number }
  | { type: TokenType.LtEq; offset: number }
  | { type: TokenType.Gt; offset: number }
  | { type: TokenType.GtEq; offset: number }
  | { type: TokenType.RegexOp; offset: number }
  | { type: TokenType.RegexStr; offset: number; lexeme: string }
  | { type: TokenType.True; offset: number }
  | { type: TokenType.False; offset: number }
  | { type: TokenType.In; offset: number }
  | { type: TokenType.Not; offset: number }
  | { type: TokenType.And; offset: number }
  | { type: TokenType.Or; offset: number }
  | { type: TokenType.Str; offset: number; lexeme: string }
  | { type: TokenType.QuotedStr; offset: number; lexeme: string }
  | { type: TokenType.Error; offset: number; lexeme: string }
  | { type: TokenType.EOF; offset: number };

type KeywordTokenType = TokenType.Not | TokenType.In | TokenType.False | TokenType.True;
type TokenTypeWithoutLexeme =
  | TokenType.LParen
  | TokenType.RParen
  | TokenType.Neg
  | TokenType.Lt
  | TokenType.LtEq
  | TokenType.Gt
  | TokenType.GtEq
  | TokenType.RegexOp
  | TokenType.True
  | TokenType.False
  | TokenType.In
  | TokenType.Not
  | TokenType.And
  | TokenType.Or
  | TokenType.EOF;

/**
 * Example:
 * `foo == bar'` - note how single quote doesn't have a corresponding closing quote,
 * so it's reported as unexpected
 */
export type LexingError = {
  offset: number /** note that this doesn't take into account escape characters from the original encoding of the string, e.g., within an extension manifest file's JSON encoding  */;
  lexeme: string;
  additionalInfo?: string;
};

function hintDidYouMean(...meant: string[]) {
  switch (meant.length) {
    case 1:
      return `Did you mean ${meant[0]}?`;
    case 2:
      return `Did you mean ${meant[0]} or ${meant[1]}?`;
    case 3:
      return `Did you mean ${meant[0]}, ${meant[1]} or ${meant[2]}?`;
    default: // we just don't expect that many
      return undefined;
  }
}

const hintDidYouForgetToOpenOrCloseQuote = 'Did you forget to open or close the quote?';
const hintDidYouForgetToEscapeSlash = `Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/\\'.`;

/**
 * A simple scanner for context keys.
 *
 * Example:
 *
 * ```ts
 * const scanner = new Scanner().reset('resourceFileName =~ /docker/ && !config.docker.enabled');
 * const tokens = [...scanner];
 * if (scanner.errorTokens.length > 0) {
 *     scanner.errorTokens.forEach(err => console.error(`Unexpected token at ${err.offset}: ${err.lexeme}\nHint: ${err.additional}`));
 * } else {
 *     // process tokens
 * }
 * ```
 */
export class Scanner {
  static getLexeme(token: Token): string {
    switch (token.type) {
      case TokenType.LParen:
        return '(';
      case TokenType.RParen:
        return ')';
      case TokenType.Neg:
        return '!';
      case TokenType.Eq:
        return token.isTripleEq ? '===' : '==';
      case TokenType.NotEq:
        return token.isTripleEq ? '!==' : '!=';
      case TokenType.Lt:
        return '<';
      case TokenType.LtEq:
        return '<=';
      case TokenType.Gt:
        return '>=';
      case TokenType.GtEq:
        return '>=';
      case TokenType.RegexOp:
        return '=~';
      case TokenType.RegexStr:
        return token.lexeme;
      case TokenType.True:
        return 'true';
      case TokenType.False:
        return 'false';
      case TokenType.In:
        return 'in';
      case TokenType.Not:
        return 'not';
      case TokenType.And:
        return '&&';
      case TokenType.Or:
        return '||';
      case TokenType.Str:
        return token.lexeme;
      case TokenType.QuotedStr:
        return token.lexeme;
      case TokenType.Error:
        return token.lexeme;
      case TokenType.EOF:
        return 'EOF';
      default:
        throw new Error(`unhandled token type: ${JSON.stringify(token)}; have you forgotten to add a case?`);
    }
  }

  private static _regexFlags = new Set(['i', 'g', 's', 'm', 'y', 'u'].map(ch => ch.charCodeAt(0)));

  private static _keywords = new Map<string, KeywordTokenType>([
    ['not', TokenType.Not],
    ['in', TokenType.In],
    ['false', TokenType.False],
    ['true', TokenType.True],
  ]);

  private _input = '';
  private _start = 0;
  private _current = 0;
  private _tokens: Token[] = [];
  private _errors: LexingError[] = [];

  get errors(): Readonly<LexingError[]> {
    return this._errors;
  }

  reset(value: string) {
    this._input = value;

    this._start = 0;
    this._current = 0;
    this._tokens = [];
    this._errors = [];

    return this;
  }

  scan() {
    while (!this._isAtEnd()) {
      this._start = this._current;

      const ch = this._advance();
      this.scanAtPosition(ch);
    }
    this._start = this._current;
    this._addToken(TokenType.EOF);

    return Array.from(this._tokens);
  }

  scanAtPosition(ch: number) {
    switch (ch) {
      case CharCode.OpenParen:
        this._addToken(TokenType.LParen);
        break;
      case CharCode.CloseParen:
        this._addToken(TokenType.RParen);
        break;

      case CharCode.ExclamationMark:
        this._scanExclamationMark();
        break;

      case CharCode.SingleQuote:
        this._quotedString();
        break;
      case CharCode.Slash:
        this._regex();
        break;

      case CharCode.Equals:
        this._scanEquals();
        break;

      case CharCode.LessThan:
        this._addToken(this._match(CharCode.Equals) ? TokenType.LtEq : TokenType.Lt);
        break;

      case CharCode.GreaterThan:
        this._addToken(this._match(CharCode.Equals) ? TokenType.GtEq : TokenType.Gt);
        break;

      case CharCode.Ampersand:
        this._scanAmpersand();
        break;

      case CharCode.Pipe:
        this._scanPipe();
        break;

      case CharCode.Space:
      case CharCode.CarriageReturn:
      case CharCode.Tab:
      case CharCode.LineFeed:
      case CharCode.NoBreakSpace: // &nbsp
        break;

      default:
        this._string();
    }
  }

  _scanExclamationMark() {
    if (this._match(CharCode.Equals)) {
      const isTripleEq = this._match(CharCode.Equals); // eat last `=` if `!==`
      this._tokens.push({ type: TokenType.NotEq, offset: this._start, isTripleEq });
    } else {
      this._addToken(TokenType.Neg);
    }
  }

  _scanEquals() {
    if (this._match(CharCode.Equals)) {
      // support `==`
      const isTripleEq = this._match(CharCode.Equals); // eat last `=` if `===`
      this._tokens.push({ type: TokenType.Eq, offset: this._start, isTripleEq });
    } else if (this._match(CharCode.Tilde)) {
      this._addToken(TokenType.RegexOp);
    } else {
      this._error(hintDidYouMean('==', '=~'));
    }
  }

  _scanAmpersand() {
    if (this._match(CharCode.Ampersand)) {
      this._addToken(TokenType.And);
    } else {
      this._error(hintDidYouMean('&&'));
    }
  }

  _scanPipe() {
    if (this._match(CharCode.Pipe)) {
      this._addToken(TokenType.Or);
    } else {
      this._error(hintDidYouMean('||'));
    }
  }

  private _match(expected: number): boolean {
    if (this._isAtEnd()) {
      return false;
    }
    if (this._input.charCodeAt(this._current) !== expected) {
      return false;
    }
    this._current++;
    return true;
  }

  private _advance(): number {
    return this._input.charCodeAt(this._current++);
  }

  private _peek(): number {
    return this._isAtEnd() ? CharCode.Null : this._input.charCodeAt(this._current);
  }

  private _addToken(type: TokenTypeWithoutLexeme) {
    this._tokens.push({ type, offset: this._start });
  }

  private _error(additional?: string) {
    const offset = this._start;
    const lexeme = this._input.substring(this._start, this._current);
    const errToken: Token = { type: TokenType.Error, offset: this._start, lexeme };
    this._errors.push({ offset, lexeme, additionalInfo: additional });
    this._tokens.push(errToken);
  }

  /* eslint-disable-next-line no-useless-escape, sonarjs/duplicates-in-character-class */
  private stringRe = /[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;
  private _string() {
    this.stringRe.lastIndex = this._start;
    const match = this.stringRe.exec(this._input);
    if (match) {
      this._current = this._start + match[0].length;
      const lexeme = this._input.substring(this._start, this._current);
      const keyword = Scanner._keywords.get(lexeme);
      if (keyword) {
        this._addToken(keyword);
      } else {
        this._tokens.push({ type: TokenType.Str, lexeme, offset: this._start });
      }
    }
  }

  // captures the lexeme without the leading and trailing '
  private _quotedString() {
    while (this._peek() !== CharCode.SingleQuote && !this._isAtEnd()) {
      this._advance();
    }

    if (this._isAtEnd()) {
      this._error(hintDidYouForgetToOpenOrCloseQuote);
      return;
    }

    // consume the closing '
    this._advance();

    this._tokens.push({
      type: TokenType.QuotedStr,
      lexeme: this._input.substring(this._start + 1, this._current - 1),
      offset: this._start + 1,
    });
  }

  /*
   * Lexing a regex expression: /.../[igsmyu]*
   * Based on https://github.com/microsoft/TypeScript/blob/9247ef115e617805983740ba795d7a8164babf89/src/compiler/scanner.ts#L2129-L2181
   *
   * Note that we want slashes within a regex to be escaped, e.g., /file:\\/\\/\\// should match `file:///`
   */
  private _regex() {
    let p = this._current;

    let inEscape = false;
    let inCharacterClass = false;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      if (p >= this._input.length) {
        this._current = p;
        this._error(hintDidYouForgetToEscapeSlash);
        return;
      }

      const ch = this._input.charCodeAt(p);

      if (inEscape) {
        // parsing an escape character
        inEscape = false;
      } else if (ch === CharCode.Slash && !inCharacterClass) {
        // end of regex
        p++;
        break;
      } else if (ch === CharCode.OpenSquareBracket) {
        inCharacterClass = true;
      } else if (ch === CharCode.Backslash) {
        inEscape = true;
      } else if (ch === CharCode.CloseSquareBracket) {
        inCharacterClass = false;
      }
      p++;
    }

    // Consume flags
    while (p < this._input.length && Scanner._regexFlags.has(this._input.charCodeAt(p))) {
      p++;
    }

    this._current = p;

    const lexeme = this._input.substring(this._start, this._current);
    this._tokens.push({ type: TokenType.RegexStr, lexeme, offset: this._start });
  }

  private _isAtEnd() {
    return this._current >= this._input.length;
  }
}
