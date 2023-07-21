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
  Eq,
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
  | { type: TokenType.Eq; offset: number; isTripleEq: boolean }
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
      case TokenType.Eq:
        return token.isTripleEq ? '===' : '==';
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
      switch (ch) {
        case CharCode.OpenParen:
          this._addToken(TokenType.LParen);
          break;
        case CharCode.CloseParen:
          this._addToken(TokenType.RParen);
          break;
        case CharCode.Equals:
          if (this._match(CharCode.Equals)) {
            // support `==`
            const isTripleEq = this._match(CharCode.Equals); // eat last `=` if `===`
            this._tokens.push({ type: TokenType.Eq, offset: this._start, isTripleEq });
          }
          break;
        case CharCode.Ampersand:
          if (this._match(CharCode.Ampersand)) {
            this._addToken(TokenType.And);
          }
          break;

        case CharCode.Pipe:
          if (this._match(CharCode.Pipe)) {
            this._addToken(TokenType.Or);
          }
          break;

        case CharCode.SingleQuote:
          this._quotedString();
          break;

        // TODO@ulugbekna: 1) rewrite using a regex 2) reconsider what characters are considered whitespace, including unicode, nbsp, etc.
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

    this._start = this._current;
    this._addToken(TokenType.EOF);

    return Array.from(this._tokens);
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

  // u - unicode, y - sticky
  // TODO@ulugbekna: we accept double quotes as part of the string rather than as a delimiter (to preserve old parser's behavior)
  // eslint-disable-next-line no-useless-escape
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
      // TODO@ulugbekna: add support for escaping ' ?
      this._advance();
    }

    if (this._isAtEnd()) {
      this._error('Did you forget to open or close the quote?');
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

  private _isAtEnd() {
    return this._current >= this._input.length;
  }
}
