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
// based on https://github.com/microsoft/vscode/blob/3eed9319874b7ca037128962593b6a8630869253/src/vs/platform/contextkey/common/contextkey.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-nested-switch */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Event } from '@podman-desktop/api';

import type { ContextKeyValue, IContext } from '../../../../main/src/plugin/api/context-info.js';
import type { IDisposable } from '../../../../main/src/plugin/types/disposable.js';
import { CharCode } from '../../../../main/src/plugin/util/charCode.js';
import type { LexingError, Token } from './scanner.js';
import { Scanner, TokenType } from './scanner.js';

const CONSTANT_VALUES = new Map<string, boolean>();
CONSTANT_VALUES.set('false', false);
CONSTANT_VALUES.set('true', true);

export async function initContextKeysPlatform(): Promise<void> {
  const platform = await window.getOsPlatform();
  CONSTANT_VALUES.set('isMac', platform === 'darwin');
  CONSTANT_VALUES.set('isLinux', platform === 'linux');
  CONSTANT_VALUES.set('isWindows', platform === 'win32');
}

/** allow register constant context keys that are known only after startup; requires running `substituteConstants` on the context key - https://github.com/microsoft/vscode/issues/174218#issuecomment-1437972127 */
export function setConstant(key: string, value: boolean) {
  if (CONSTANT_VALUES.get(key) !== undefined) {
    throw new Error('contextkey.setConstant(k, v) invoked with already set constant `k`');
  }

  CONSTANT_VALUES.set(key, value);
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const enum ContextKeyExprType {
  False = 0,
  True = 1,
  Defined = 2,
  Not = 3,
  Equals = 4,
  NotEquals = 5,
  And = 6,
  Regex = 7,
  NotRegex = 8,
  Or = 9,
  In = 10,
  NotIn = 11,
  Greater = 12,
  GreaterEquals = 13,
  Smaller = 14,
  SmallerEquals = 15,
}

export interface IContextKeyExprMapper {
  mapDefined(key: string): ContextKeyExpression;
  mapNot(key: string): ContextKeyExpression;
  mapEquals(key: string, value: any): ContextKeyExpression;
  mapNotEquals(key: string, value: any): ContextKeyExpression;
  mapGreater(key: string, value: any): ContextKeyExpression;
  mapGreaterEquals(key: string, value: any): ContextKeyExpression;
  mapSmaller(key: string, value: any): ContextKeyExpression;
  mapSmallerEquals(key: string, value: any): ContextKeyExpression;
  mapRegex(key: string, regexp: RegExp | undefined): ContextKeyRegexExpr;
  mapIn(key: string, valueKey: string): ContextKeyInExpr;
  mapNotIn(key: string, valueKey: string): ContextKeyNotInExpr;
}

export interface IContextKeyExpression {
  cmp(other: ContextKeyExpression): number;
  equals(other: ContextKeyExpression): boolean;
  substituteConstants(): ContextKeyExpression | undefined;
  evaluate(context: IContext): boolean;
  serialize(): string;
  keys(): string[];
  map(mapFnc: IContextKeyExprMapper): ContextKeyExpression;
  negate(): ContextKeyExpression;
}

export type ContextKeyExpression =
  | ContextKeyFalseExpr
  | ContextKeyTrueExpr
  | ContextKeyDefinedExpr
  | ContextKeyNotExpr
  | ContextKeyEqualsExpr
  | ContextKeyNotEqualsExpr
  | ContextKeyRegexExpr
  | ContextKeyNotRegexExpr
  | ContextKeyAndExpr
  | ContextKeyOrExpr
  | ContextKeyInExpr
  | ContextKeyNotInExpr
  | ContextKeyGreaterExpr
  | ContextKeyGreaterEqualsExpr
  | ContextKeySmallerExpr
  | ContextKeySmallerEqualsExpr;

/*

Syntax grammar:

```ebnf

expression ::= or

or ::= and { '||' and }*

and ::= term { '&&' term }*

term ::=
	| '!' (KEY | true | false | parenthesized)
	| primary

primary ::=
	| 'true'
	| 'false'
	| parenthesized
	| KEY '=~' REGEX
	| KEY [ ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'not' 'in' | 'in') value ]

parenthesized ::=
	| '(' expression ')'

value ::=
	| 'true'
	| 'false'
	| 'in'      	// we support `in` as a value because there's an extension that uses it, ie "when": "languageId == in"
	| VALUE 		// matched by the same regex as KEY; consider putting the value in single quotes if it's a string (e.g., with spaces)
	| SINGLE_QUOTED_STR
	| EMPTY_STR  	// this allows "when": "foo == " which's used by existing extensions

```
*/

export type ParserConfig = {
  /**
   * with this option enabled, the parser can recover from regex parsing errors, e.g., unescaped slashes: `/src//` is accepted as `/src\//` would be
   */
  regexParsingWithErrorRecovery: boolean;
};

const defaultConfig: ParserConfig = {
  regexParsingWithErrorRecovery: true,
};

export type ParsingError = {
  message: string;
  offset: number;
  lexeme: string;
  additionalInfo?: string;
};

const errorEmptyString = 'Empty context key expression';
const hintEmptyString = `Did you forget to write an expression? You can also put 'false' or 'true' to always evaluate to false or true, respectively.`;
const errorNoInAfterNot = `'in' after 'not'.`;
const errorClosingParenthesis = `closing parenthesis ')'`;
const errorUnexpectedToken = 'Unexpected token';
const hintUnexpectedToken = 'Did you forget to put && or || before the token?';
const errorUnexpectedEOF = 'Unexpected end of expression';
const hintUnexpectedEOF = 'Did you forget to put a context key?';

/**
 * A parser for context key expressions.
 *
 * Example:
 * ```ts
 * const parser = new Parser();
 * const expr = parser.parse('foo == "bar" && baz == true');
 *
 * if (expr === undefined) {
 * 	// there were lexing or parsing errors
 * 	// process lexing errors with `parser.lexingErrors`
 *  // process parsing errors with `parser.parsingErrors`
 * } else {
 * 	// expr is a valid expression
 * }
 * ```
 */
export class Parser {
  // Note: this doesn't produce an exact syntax tree but a normalized one
  // ContextKeyExpression's that we use as AST nodes do not expose constructors that do not normalize

  private static _parseError = new Error();

  // lifetime note: `_scanner` lives as long as the parser does, i.e., is not reset between calls to `parse`
  private readonly _scanner = new Scanner();

  // lifetime note: `_tokens`, `_current`, and `_parsingErrors` must be reset between calls to `parse`
  private _tokens: Token[] = [];
  private _current = 0; // invariant: 0 <= this._current < this._tokens.length ; any incrementation of this value must first call `_isAtEnd`
  private _parsingErrors: ParsingError[] = [];

  get lexingErrors(): Readonly<LexingError[]> {
    return this._scanner.errors;
  }

  get parsingErrors(): Readonly<ParsingError[]> {
    return this._parsingErrors;
  }

  constructor(private readonly _config: ParserConfig = defaultConfig) {}

  /**
   * Parse a context key expression.
   *
   * @param input the expression to parse
   * @returns the parsed expression or `undefined` if there's an error - call `lexingErrors` and `parsingErrors` to see the errors
   */
  parse(input: string): ContextKeyExpression | undefined {
    if (input === '') {
      this._parsingErrors.push({ message: errorEmptyString, offset: 0, lexeme: '', additionalInfo: hintEmptyString });
      return undefined;
    }

    this._tokens = this._scanner.reset(input).scan();
    // @ulugbekna: we do not stop parsing if there are lexing errors to be able to reconstruct regexes with unescaped slashes; TODO@ulugbekna: make this respect config option for recovery

    this._current = 0;
    this._parsingErrors = [];

    try {
      const expr = this._expr();
      if (!this._isAtEnd()) {
        const peek = this._peek();
        const additionalInfo = peek.type === TokenType.Str ? hintUnexpectedToken : undefined;
        this._parsingErrors.push({
          message: errorUnexpectedToken,
          offset: peek.offset,
          lexeme: Scanner.getLexeme(peek),
          additionalInfo,
        });
        throw Parser._parseError;
      }
      return expr;
    } catch (e) {
      if (!(e === Parser._parseError)) {
        throw e;
      }
      return undefined;
    }
  }

  private _expr(): ContextKeyExpression | undefined {
    return this._or();
  }

  private _or(): ContextKeyExpression | undefined {
    const expr = [this._and()];

    while (this._matchOne(TokenType.Or)) {
      const right = this._and();
      expr.push(right);
    }

    return expr.length === 1 ? expr[0] : ContextKeyExpr.or(...expr);
  }

  private _and(): ContextKeyExpression | undefined {
    const expr = [this._term()];

    while (this._matchOne(TokenType.And)) {
      const right = this._term();
      expr.push(right);
    }

    return expr.length === 1 ? expr[0] : ContextKeyExpr.and(...expr);
  }

  private _term(): ContextKeyExpression | undefined {
    if (this._matchOne(TokenType.Neg)) {
      const peek = this._peek();
      switch (peek.type) {
        case TokenType.True:
          this._advance();
          return ContextKeyFalseExpr.INSTANCE;
        case TokenType.False:
          this._advance();
          return ContextKeyTrueExpr.INSTANCE;
        case TokenType.LParen: {
          this._advance();
          const expr = this._expr();
          this._consume(TokenType.RParen, errorClosingParenthesis);
          return expr?.negate();
        }
        case TokenType.Str:
          this._advance();
          return ContextKeyNotExpr.create(peek.lexeme);
        default:
          throw this._errExpectedButGot(`KEY | true | false | '(' expression ')'`, peek);
      }
    }
    return this._primary();
  }

  private _primary(): ContextKeyExpression | undefined {
    const peek = this._peek();
    switch (peek.type) {
      case TokenType.True:
        this._advance();
        return ContextKeyExpr.true();

      case TokenType.False:
        this._advance();
        return ContextKeyExpr.false();

      case TokenType.LParen: {
        this._advance();
        const expr = this._expr();
        this._consume(TokenType.RParen, errorClosingParenthesis);
        return expr;
      }

      case TokenType.Str: {
        // KEY
        const key = peek.lexeme;
        this._advance();

        // =~ regex
        if (this._matchOne(TokenType.RegexOp)) {
          // @ulugbekna: we need to reconstruct the regex from the tokens because some extensions use unescaped slashes in regexes
          const expr = this._peek();

          if (!this._config.regexParsingWithErrorRecovery) {
            this._advance();
            if (expr.type !== TokenType.RegexStr) {
              throw this._errExpectedButGot('REGEX', expr);
            }
            const regexLexeme = expr.lexeme;
            const closingSlashIndex = regexLexeme.lastIndexOf('/');
            const flags =
              closingSlashIndex === regexLexeme.length - 1
                ? undefined
                : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
            let regexp: RegExp;
            try {
              regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
            } catch (e) {
              throw this._errExpectedButGot('REGEX', expr);
            }
            return ContextKeyRegexExpr.create(key, regexp);
          }

          this._innerToken(expr, key);
        }

        // [ 'not' 'in' value ]
        if (this._matchOne(TokenType.Not)) {
          this._consume(TokenType.In, errorNoInAfterNot);
          const right = this._value();
          return ContextKeyExpr.notIn(key, right);
        }

        // [ ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in') value ]
        const maybeOp = this._peek().type;
        return this._maybeOperation(maybeOp, key);
      }

      case TokenType.EOF:
        this._parsingErrors.push({
          message: errorUnexpectedEOF,
          offset: peek.offset,
          lexeme: '',
          additionalInfo: hintUnexpectedEOF,
        });
        throw Parser._parseError;

      default:
        throw this._errExpectedButGot(
          `true | false | KEY \n\t| KEY '=~' REGEX \n\t| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`,
          this._peek(),
        );
    }
  }

  private _innerToken(expr: Token, key: string): ContextKeyExpression {
    switch (expr.type) {
      case TokenType.RegexStr:
      case TokenType.Error: {
        // also handle an ErrorToken in case of smth such as /(/file)/
        const lexemeReconstruction = [expr.lexeme]; // /REGEX/ or /REGEX/FLAGS
        this._advance();

        let followingToken = this._peek();
        let parenBalance = 0;
        for (let i = 0; i < expr.lexeme.length; i++) {
          if (expr.lexeme.charCodeAt(i) === CharCode.OpenParen) {
            parenBalance++;
          } else if (expr.lexeme.charCodeAt(i) === CharCode.CloseParen) {
            parenBalance--;
          }
        }

        while (!this._isAtEnd() && followingToken.type !== TokenType.And && followingToken.type !== TokenType.Or) {
          const deltaBalance = this._deltaBalance(followingToken, expr);
          parenBalance += deltaBalance;
          if (parenBalance < 0) {
            break;
          }
          lexemeReconstruction.push(Scanner.getLexeme(followingToken));
          this._advance();
          followingToken = this._peek();
        }

        const regexLexeme = lexemeReconstruction.join('');
        const closingSlashIndex = regexLexeme.lastIndexOf('/');
        const flags =
          closingSlashIndex === regexLexeme.length - 1
            ? undefined
            : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
        let regexp: RegExp | undefined;
        try {
          regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
        } catch (e) {
          throw this._errExpectedButGot('REGEX', expr);
        }
        return ContextKeyExpr.regex(key, regexp);
      }

      case TokenType.QuotedStr: {
        const serializedValue = expr.lexeme;
        this._advance();
        // replicate old regex parsing behavior

        let regex: RegExp | undefined = undefined;

        if (!isFalsyOrWhitespace(serializedValue)) {
          const start = serializedValue.indexOf('/');
          const end = serializedValue.lastIndexOf('/');
          if (start !== end && start >= 0) {
            const value = serializedValue.slice(start + 1, end);
            const caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
            try {
              regex = new RegExp(value, caseIgnoreFlag);
            } catch (_e) {
              throw this._errExpectedButGot('REGEX', expr);
            }
          }
        }

        if (regex === undefined) {
          throw this._errExpectedButGot('REGEX', expr);
        }

        return ContextKeyRegexExpr.create(key, regex);
      }

      default:
        throw this._errExpectedButGot('REGEX', this._peek());
    }
  }

  private _deltaBalance(
    followingToken: Token,
    expr:
      | {
          type: TokenType.RegexStr;
          offset: number;
          lexeme: string;
        }
      | {
          type: TokenType.Error;
          offset: number;
          lexeme: string;
        },
  ) {
    let parenBalance = 0;
    switch (followingToken.type) {
      case TokenType.LParen:
        parenBalance++;
        break;
      case TokenType.RParen:
        parenBalance--;
        break;
      case TokenType.RegexStr:
      case TokenType.QuotedStr:
        for (let i = 0; i < followingToken.lexeme.length; i++) {
          if (followingToken.lexeme.charCodeAt(i) === CharCode.OpenParen) {
            parenBalance++;
          } else if (expr.lexeme.charCodeAt(i) === CharCode.CloseParen) {
            parenBalance--;
          }
        }
    }
    return parenBalance;
  }

  private _maybeOperation(maybeOp: TokenType, key: string): ContextKeyExpression {
    switch (maybeOp) {
      case TokenType.Eq: {
        this._advance();

        const right = this._value();
        if (this._previous().type === TokenType.QuotedStr) {
          // to preserve old parser behavior: "foo == 'true'" is preserved as "foo == 'true'", but "foo == true" is optimized as "foo"
          return ContextKeyExpr.equals(key, right);
        }
        return this._equalsRight(right, key);
      }

      case TokenType.NotEq: {
        this._advance();

        const right = this._value();
        if (this._previous().type === TokenType.QuotedStr) {
          // same as above with "foo != 'true'"
          return ContextKeyExpr.notEquals(key, right);
        }
        return this._notEqualRight(right, key);
      }
      // TODO: ContextKeyExpr.smaller(key, right) accepts only `number` as `right` AND during eval of this node, we just eval to `false` if `right` is not a number
      // consequently, package.json linter should _warn_ the user if they're passing undesired things to ops
      case TokenType.Lt:
        this._advance();
        return ContextKeySmallerExpr.create(key, this._value());

      case TokenType.LtEq:
        this._advance();
        return ContextKeySmallerEqualsExpr.create(key, this._value());

      case TokenType.Gt:
        this._advance();
        return ContextKeyGreaterExpr.create(key, this._value());

      case TokenType.GtEq:
        this._advance();
        return ContextKeyGreaterEqualsExpr.create(key, this._value());

      case TokenType.In:
        this._advance();
        return ContextKeyExpr.in(key, this._value());

      default:
        return ContextKeyExpr.has(key);
    }
  }

  private _equalsRight(right: string, key: string): ContextKeyExpression {
    switch (right) {
      case 'true':
        return ContextKeyExpr.has(key);
      case 'false':
        return ContextKeyExpr.not(key);
      default:
        return ContextKeyExpr.equals(key, right);
    }
  }

  private _notEqualRight(right: string, key: string): ContextKeyExpression {
    switch (right) {
      case 'true':
        return ContextKeyExpr.not(key);
      case 'false':
        return ContextKeyExpr.has(key);
      default:
        return ContextKeyExpr.notEquals(key, right);
    }
  }

  private _value(): string {
    const token = this._peek();
    switch (token.type) {
      case TokenType.Str:
      case TokenType.QuotedStr:
        this._advance();
        return token.lexeme;
      case TokenType.True:
        this._advance();
        return 'true';
      case TokenType.False:
        this._advance();
        return 'false';
      case TokenType.In: // we support `in` as a value, e.g., "when": "languageId == in" - exists in existing extensions
        this._advance();
        return 'in';
      default:
        // this allows "when": "foo == " which's used by existing extensions
        // we do not call `_advance` on purpose - we don't want to eat unintended tokens
        return '';
    }
  }

  private _flagsGYRe = /g|y/g;
  private _removeFlagsGY(flags: string): string {
    return flags.replaceAll(this._flagsGYRe, '');
  }

  // careful: this can throw if current token is the initial one (ie index = 0)
  private _previous() {
    return this._tokens[this._current - 1];
  }

  private _matchOne(token: TokenType) {
    if (this._check(token)) {
      this._advance();
      return true;
    }

    return false;
  }

  private _advance() {
    if (!this._isAtEnd()) {
      this._current++;
    }
    return this._previous();
  }

  private _consume(type: TokenType, message: string) {
    if (this._check(type)) {
      return this._advance();
    }

    throw this._errExpectedButGot(message, this._peek());
  }

  private _errExpectedButGot(expected: string, got: Token, additionalInfo?: string) {
    const message = `Expected: ${expected}\nReceived: '${Scanner.getLexeme(got)}'.`;
    const offset = got.offset;
    const lexeme = Scanner.getLexeme(got);
    this._parsingErrors.push({ message, offset, lexeme, additionalInfo });
    return Parser._parseError;
  }

  private _check(type: TokenType) {
    return this._peek().type === type;
  }

  private _peek() {
    return this._tokens[this._current];
  }

  private _isAtEnd() {
    return this._peek().type === TokenType.EOF;
  }
}

export abstract class ContextKeyExpr {
  public static false(): ContextKeyExpression {
    return ContextKeyFalseExpr.INSTANCE;
  }
  public static true(): ContextKeyExpression {
    return ContextKeyTrueExpr.INSTANCE;
  }
  public static has(key: string): ContextKeyExpression {
    return ContextKeyDefinedExpr.create(key);
  }
  public static equals(key: string, value: any): ContextKeyExpression {
    return ContextKeyEqualsExpr.create(key, value);
  }
  public static notEquals(key: string, value: any): ContextKeyExpression {
    return ContextKeyNotEqualsExpr.create(key, value);
  }
  public static regex(key: string, value: RegExp): ContextKeyExpression {
    return ContextKeyRegexExpr.create(key, value);
  }
  public static in(key: string, value: string): ContextKeyExpression {
    return ContextKeyInExpr.create(key, value);
  }
  public static notIn(key: string, value: string): ContextKeyExpression {
    return ContextKeyNotInExpr.create(key, value);
  }
  public static not(key: string): ContextKeyExpression {
    return ContextKeyNotExpr.create(key);
  }
  public static and(...expr: Array<ContextKeyExpression | undefined>): ContextKeyExpression | undefined {
    return ContextKeyAndExpr.create(expr, undefined, true);
  }
  public static or(...expr: Array<ContextKeyExpression | undefined>): ContextKeyExpression | undefined {
    return ContextKeyOrExpr.create(expr, undefined, true);
  }
  public static greater(key: string, value: number): ContextKeyExpression {
    return ContextKeyGreaterExpr.create(key, value);
  }
  public static greaterEquals(key: string, value: number): ContextKeyExpression {
    return ContextKeyGreaterEqualsExpr.create(key, value);
  }
  public static smaller(key: string, value: number): ContextKeyExpression {
    return ContextKeySmallerExpr.create(key, value);
  }
  public static smallerEquals(key: string, value: number): ContextKeyExpression {
    return ContextKeySmallerEqualsExpr.create(key, value);
  }

  private static _parser = new Parser({ regexParsingWithErrorRecovery: false });
  public static deserialize(serialized: string | undefined): ContextKeyExpression | undefined {
    if (serialized === undefined) {
      // an empty string needs to be handled by the parser to get a corresponding parsing error reported
      return undefined;
    }

    return this._parser.parse(serialized);
  }
}

export function validateWhenClauses(whenClauses: string[]): any {
  const parser = new Parser({ regexParsingWithErrorRecovery: false }); // we run with no recovery to guide users to use correct regexes

  return whenClauses.map(whenClause => {
    parser.parse(whenClause);

    if (parser.lexingErrors.length > 0) {
      return parser.lexingErrors.map((se: LexingError) => ({
        errorMessage: se.additionalInfo ? `Unexpected token. Hint: ${se.additionalInfo}` : 'Unexpected token.',
        offset: se.offset,
        length: se.lexeme.length,
      }));
    } else if (parser.parsingErrors.length > 0) {
      return parser.parsingErrors.map((pe: ParsingError) => ({
        errorMessage: pe.additionalInfo ? `${pe.message}. ${pe.additionalInfo}` : pe.message,
        offset: pe.offset,
        length: pe.lexeme.length,
      }));
    } else {
      return [];
    }
  });
}

export function expressionsAreEqualWithConstantSubstitution(
  a: ContextKeyExpression | undefined,
  b: ContextKeyExpression | undefined,
): boolean {
  const aExpr = a ? a.substituteConstants() : undefined;
  const bExpr = b ? b.substituteConstants() : undefined;
  if (!aExpr && !bExpr) {
    return true;
  }
  if (!aExpr || !bExpr) {
    return false;
  }
  return aExpr.equals(bExpr);
}

function cmp(a: ContextKeyExpression, b: ContextKeyExpression): number {
  return a.cmp(b);
}

export class ContextKeyFalseExpr implements IContextKeyExpression {
  public static INSTANCE = new ContextKeyFalseExpr();

  public readonly type = ContextKeyExprType.False;

  protected constructor() {}

  public cmp(other: ContextKeyExpression): number {
    return this.type - other.type;
  }

  public equals(other: ContextKeyExpression): boolean {
    return other.type === this.type;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(_context: IContext): boolean {
    return false;
  }

  public serialize(): string {
    return 'false';
  }

  public keys(): string[] {
    return [];
  }

  public map(_mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return this;
  }

  public negate(): ContextKeyExpression {
    return ContextKeyTrueExpr.INSTANCE;
  }
}

export class ContextKeyTrueExpr implements IContextKeyExpression {
  public static INSTANCE = new ContextKeyTrueExpr();

  public readonly type = ContextKeyExprType.True;

  protected constructor() {}

  public cmp(other: ContextKeyExpression): number {
    return this.type - other.type;
  }

  public equals(other: ContextKeyExpression): boolean {
    return other.type === this.type;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(_context: IContext): boolean {
    return true;
  }

  public serialize(): string {
    return 'true';
  }

  public keys(): string[] {
    return [];
  }

  public map(_mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return this;
  }

  public negate(): ContextKeyExpression {
    return ContextKeyFalseExpr.INSTANCE;
  }
}

export class ContextKeyDefinedExpr implements IContextKeyExpression {
  public static create(key: string, negated: ContextKeyExpression | undefined = undefined): ContextKeyExpression {
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === 'boolean') {
      return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return new ContextKeyDefinedExpr(key, negated);
  }

  public readonly type = ContextKeyExprType.Defined;

  protected constructor(
    readonly key: string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp1(this.key, other.key);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === 'boolean') {
      return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return this;
  }

  public evaluate(context: IContext): boolean {
    return !!context.getValue(this.key);
  }

  public serialize(): string {
    return this.key;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapDefined(this.key);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyNotExpr.create(this.key, this);
    }
    return this.negated;
  }
}

export class ContextKeyEqualsExpr implements IContextKeyExpression {
  public static create(
    key: string,
    value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    if (typeof value === 'boolean') {
      return value ? ContextKeyDefinedExpr.create(key, negated) : ContextKeyNotExpr.create(key, negated);
    }
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === 'boolean') {
      const trueValue = constantValue ? 'true' : 'false';
      return value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return new ContextKeyEqualsExpr(key, value, negated);
  }

  public readonly type = ContextKeyExprType.Equals;

  private constructor(
    private readonly key: string,
    private readonly value: any,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === 'boolean') {
      const trueValue = constantValue ? 'true' : 'false';
      return this.value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
    }
    return this;
  }

  public evaluate(context: IContext): boolean {
    // Intentional ==
    // eslint-disable-next-line eqeqeq
    return context.getValue(this.key) == this.value;
  }

  public serialize(): string {
    return `${this.key} == '${this.value}'`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapEquals(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyNotEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeyInExpr implements IContextKeyExpression {
  public static create(key: string, valueKey: string): ContextKeyInExpr {
    return new ContextKeyInExpr(key, valueKey);
  }

  public readonly type = ContextKeyExprType.In;
  private negated: ContextKeyExpression | undefined = undefined;

  private constructor(
    private readonly key: string,
    private readonly valueKey: string,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.valueKey, other.key, other.valueKey);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.valueKey === other.valueKey;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    const source = context.getValue(this.valueKey);

    const item = context.getValue(this.key);

    if (Array.isArray(source)) {
      // if item is undefined, the user has passed a string that has to be found in source
      if (!item) {
        return source.includes(this.key);
      }
      return source.includes(item as any);
    }

    if (typeof item === 'string' && typeof source === 'object' && source !== undefined) {
      return hasOwnProperty.call(source, item);
    }
    return false;
  }

  public serialize(): string {
    return `${this.key} in '${this.valueKey}'`;
  }

  public keys(): string[] {
    return [this.key, this.valueKey];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyInExpr {
    return mapFnc.mapIn(this.key, this.valueKey);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyNotInExpr.create(this.key, this.valueKey);
    }
    return this.negated;
  }
}

export class ContextKeyNotInExpr implements IContextKeyExpression {
  public static create(key: string, valueKey: string): ContextKeyNotInExpr {
    return new ContextKeyNotInExpr(key, valueKey);
  }

  public readonly type = ContextKeyExprType.NotIn;

  private readonly _negated: ContextKeyInExpr;

  private constructor(
    private readonly key: string,
    private readonly valueKey: string,
  ) {
    this._negated = ContextKeyInExpr.create(key, valueKey);
  }

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return this._negated.cmp(other._negated);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this._negated.equals(other._negated);
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    return !this._negated.evaluate(context);
  }

  public serialize(): string {
    return `${this.key} not in '${this.valueKey}'`;
  }

  public keys(): string[] {
    return this._negated.keys();
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapNotIn(this.key, this.valueKey);
  }

  public negate(): ContextKeyExpression {
    return this._negated;
  }
}

export class ContextKeyNotEqualsExpr implements IContextKeyExpression {
  public static create(
    key: string,
    value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    if (typeof value === 'boolean') {
      if (value) {
        return ContextKeyNotExpr.create(key, negated);
      }
      return ContextKeyDefinedExpr.create(key, negated);
    }
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === 'boolean') {
      const falseValue = constantValue ? 'true' : 'false';
      return value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return new ContextKeyNotEqualsExpr(key, value, negated);
  }

  public readonly type = ContextKeyExprType.NotEquals;

  private constructor(
    private readonly key: string,
    private readonly value: any,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === 'boolean') {
      const falseValue = constantValue ? 'true' : 'false';
      return this.value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return this;
  }

  public evaluate(context: IContext): boolean {
    // Intentional !=
    // eslint-disable-next-line eqeqeq
    return context.getValue(this.key) != this.value;
  }

  public serialize(): string {
    return `${this.key} != '${this.value}'`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapNotEquals(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeyNotExpr implements IContextKeyExpression {
  public static create(key: string, negated: ContextKeyExpression | undefined = undefined): ContextKeyExpression {
    const constantValue = CONSTANT_VALUES.get(key);
    if (typeof constantValue === 'boolean') {
      return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return new ContextKeyNotExpr(key, negated);
  }

  public readonly type = ContextKeyExprType.Not;

  private constructor(
    private readonly key: string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp1(this.key, other.key);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const constantValue = CONSTANT_VALUES.get(this.key);
    if (typeof constantValue === 'boolean') {
      return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
    }
    return this;
  }

  public evaluate(context: IContext): boolean {
    return !context.getValue(this.key);
  }

  public serialize(): string {
    return `!${this.key}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapNot(this.key);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyDefinedExpr.create(this.key, this);
    }
    return this.negated;
  }
}

function withFloatOrStr<T extends ContextKeyExpression>(
  value: any,
  callback: (value: number | string) => T,
): T | ContextKeyFalseExpr {
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (!isNaN(n)) {
      value = n;
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return callback(value);
  }
  return ContextKeyFalseExpr.INSTANCE;
}

export class ContextKeyGreaterExpr implements IContextKeyExpression {
  public static create(
    key: string,
    _value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    return withFloatOrStr(_value, value => new ContextKeyGreaterExpr(key, value, negated));
  }

  public readonly type = ContextKeyExprType.Greater;

  private constructor(
    private readonly key: string,
    private readonly value: number | string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    if (typeof this.value === 'string') {
      return false;
    }
    return parseFloat(<any>context.getValue(this.key)) > this.value;
  }

  public serialize(): string {
    return `${this.key} > ${this.value}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapGreater(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeySmallerEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeyGreaterEqualsExpr implements IContextKeyExpression {
  public static create(
    key: string,
    _value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    return withFloatOrStr(_value, value => new ContextKeyGreaterEqualsExpr(key, value, negated));
  }

  public readonly type = ContextKeyExprType.GreaterEquals;

  private constructor(
    private readonly key: string,
    private readonly value: number | string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    if (typeof this.value === 'string') {
      return false;
    }
    return parseFloat(<any>context.getValue(this.key)) >= this.value;
  }

  public serialize(): string {
    return `${this.key} >= ${this.value}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapGreaterEquals(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeySmallerExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeySmallerExpr implements IContextKeyExpression {
  public static create(
    key: string,
    _value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    return withFloatOrStr(_value, value => new ContextKeySmallerExpr(key, value, negated));
  }

  public readonly type = ContextKeyExprType.Smaller;

  private constructor(
    private readonly key: string,
    private readonly value: number | string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    if (typeof this.value === 'string') {
      return false;
    }
    return parseFloat(<any>context.getValue(this.key)) < this.value;
  }

  public serialize(): string {
    return `${this.key} < ${this.value}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapSmaller(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyGreaterEqualsExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeySmallerEqualsExpr implements IContextKeyExpression {
  public static create(
    key: string,
    _value: any,
    negated: ContextKeyExpression | undefined = undefined,
  ): ContextKeyExpression {
    return withFloatOrStr(_value, value => new ContextKeySmallerEqualsExpr(key, value, negated));
  }

  public readonly type = ContextKeyExprType.SmallerEquals;

  private constructor(
    private readonly key: string,
    private readonly value: number | string,
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return cmp2(this.key, this.value, other.key, other.value);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this.key === other.key && this.value === other.value;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    if (typeof this.value === 'string') {
      return false;
    }
    return parseFloat(<any>context.getValue(this.key)) <= this.value;
  }

  public serialize(): string {
    return `${this.key} <= ${this.value}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return mapFnc.mapSmallerEquals(this.key, this.value);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyGreaterExpr.create(this.key, this.value, this);
    }
    return this.negated;
  }
}

export class ContextKeyRegexExpr implements IContextKeyExpression {
  public static create(key: string, regexp: RegExp | undefined): ContextKeyRegexExpr {
    return new ContextKeyRegexExpr(key, regexp);
  }

  public readonly type = ContextKeyExprType.Regex;
  private negated: ContextKeyExpression | undefined = undefined;

  private constructor(
    private readonly key: string,
    private readonly regexp: RegExp | undefined,
  ) {
    //
  }

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.key < other.key) {
      return -1;
    }
    if (this.key > other.key) {
      return 1;
    }
    const thisSource = this.regexp ? this.regexp.source : '';
    const otherSource = other.regexp ? other.regexp.source : '';
    if (thisSource < otherSource) {
      return -1;
    }
    if (thisSource > otherSource) {
      return 1;
    }
    return 0;
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      const thisSource = this.regexp ? this.regexp.source : '';
      const otherSource = other.regexp ? other.regexp.source : '';
      return this.key === other.key && thisSource === otherSource;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    const value = context.getValue<any>(this.key);
    return this.regexp ? this.regexp.test(value) : false;
  }

  public serialize(): string {
    const value = this.regexp ? `/${this.regexp.source}/${this.regexp.flags}` : '/invalid/';
    return `${this.key} =~ ${value}`;
  }

  public keys(): string[] {
    return [this.key];
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyRegexExpr {
    return mapFnc.mapRegex(this.key, this.regexp);
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      this.negated = ContextKeyNotRegexExpr.create(this);
    }
    return this.negated;
  }
}

export class ContextKeyNotRegexExpr implements IContextKeyExpression {
  public static create(actual: ContextKeyRegexExpr): ContextKeyExpression {
    return new ContextKeyNotRegexExpr(actual);
  }

  public readonly type = ContextKeyExprType.NotRegex;

  private constructor(private readonly _actual: ContextKeyRegexExpr) {
    //
  }

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    return this._actual.cmp(other._actual);
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      return this._actual.equals(other._actual);
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    return this;
  }

  public evaluate(context: IContext): boolean {
    return !this._actual.evaluate(context);
  }

  public serialize(): string {
    return `!(${this._actual.serialize()})`;
  }

  public keys(): string[] {
    return this._actual.keys();
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return new ContextKeyNotRegexExpr(this._actual.map(mapFnc));
  }

  public negate(): ContextKeyExpression {
    return this._actual;
  }
}

/**
 * @returns the same instance if nothing changed.
 */
function eliminateConstantsInArray(arr: ContextKeyExpression[]): (ContextKeyExpression | undefined)[] {
  // Allocate array only if there is a difference
  let newArr: (ContextKeyExpression | undefined)[] | undefined = undefined;
  for (let i = 0, len = arr.length; i < len; i++) {
    const newExpr = arr[i].substituteConstants();

    if (arr[i] !== newExpr && newArr === undefined) {
      // something has changed!
      // allocate array on first difference
      newArr = [];
      for (let j = 0; j < i; j++) {
        newArr[j] = arr[j];
      }
    }

    if (newArr !== undefined) {
      newArr[i] = newExpr;
    }
  }

  if (newArr === undefined) {
    return arr;
  }
  return newArr;
}

export class ContextKeyAndExpr implements IContextKeyExpression {
  public static create(
    _expr: ReadonlyArray<ContextKeyExpression | undefined>,
    negated: ContextKeyExpression | undefined,
    extraRedundantCheck: boolean,
  ): ContextKeyExpression | undefined {
    return ContextKeyAndExpr._normalizeArr(_expr, negated, extraRedundantCheck);
  }

  public readonly type = ContextKeyExprType.And;

  private constructor(
    public readonly expr: ContextKeyExpression[],
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.expr.length < other.expr.length) {
      return -1;
    }
    if (this.expr.length > other.expr.length) {
      return 1;
    }
    for (let i = 0, len = this.expr.length; i < len; i++) {
      const r = cmp(this.expr[i], other.expr[i]);
      if (r !== 0) {
        return r;
      }
    }
    return 0;
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      if (this.expr.length !== other.expr.length) {
        return false;
      }
      for (let i = 0, len = this.expr.length; i < len; i++) {
        if (!this.expr[i].equals(other.expr[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const exprArr = eliminateConstantsInArray(this.expr);
    if (exprArr === this.expr) {
      // no change
      return this;
    }
    return ContextKeyAndExpr.create(exprArr, this.negated, false);
  }

  public evaluate(context: IContext): boolean {
    for (let i = 0, len = this.expr.length; i < len; i++) {
      if (!this.expr[i].evaluate(context)) {
        return false;
      }
    }
    return true;
  }

  private static _normalizeArr(
    arr: ReadonlyArray<ContextKeyExpression | undefined>,
    negated: ContextKeyExpression | undefined,
    extraRedundantCheck: boolean,
  ): ContextKeyExpression | undefined {
    const expr: ContextKeyExpression[] = [];
    let hasTrue = false;

    for (const e of arr) {
      if (!e) {
        continue;
      }

      if (e.type === ContextKeyExprType.True) {
        // anything && true ==> anything
        hasTrue = true;
        continue;
      }

      if (e.type === ContextKeyExprType.False) {
        // anything && false ==> false
        return ContextKeyFalseExpr.INSTANCE;
      }

      if (e.type === ContextKeyExprType.And) {
        expr.push(...e.expr);
        continue;
      }

      expr.push(e);
    }

    if (expr.length === 0 && hasTrue) {
      return ContextKeyTrueExpr.INSTANCE;
    }

    if (expr.length === 0) {
      return undefined;
    }

    if (expr.length === 1) {
      return expr[0];
    }

    expr.sort(cmp);

    // eliminate duplicate terms
    for (let i = 1; i < expr.length; i++) {
      if (expr[i - 1].equals(expr[i])) {
        expr.splice(i, 1);
        i--;
      }
    }

    if (expr.length === 1) {
      return expr[0];
    }

    // We must distribute any OR expression because we don't support parens
    // OR extensions will be at the end (due to sorting rules)
    while (expr.length > 1) {
      const lastElement = expr[expr.length - 1];
      if (lastElement.type !== ContextKeyExprType.Or) {
        break;
      }
      // pop the last element
      expr.pop();

      // pop the second to last element
      const secondToLastElement = expr.pop();

      const isFinished = expr.length === 0;

      // distribute `lastElement` over `secondToLastElement`
      const resultElement = ContextKeyOrExpr.create(
        lastElement.expr.map(el => ContextKeyAndExpr.create([el, secondToLastElement], undefined, extraRedundantCheck)),
        undefined,
        isFinished,
      );

      if (resultElement) {
        expr.push(resultElement);
        expr.sort(cmp);
      }
    }

    if (expr.length === 1) {
      return expr[0];
    }

    // resolve false AND expressions
    if (extraRedundantCheck) {
      for (let i = 0; i < expr.length; i++) {
        for (let j = i + 1; j < expr.length; j++) {
          if (expr[i].negate().equals(expr[j])) {
            // A && !A case
            return ContextKeyFalseExpr.INSTANCE;
          }
        }
      }

      if (expr.length === 1) {
        return expr[0];
      }
    }

    return new ContextKeyAndExpr(expr, negated);
  }

  public serialize(): string {
    return this.expr.map(e => e.serialize()).join(' && ');
  }

  public keys(): string[] {
    const result: string[] = [];
    for (const expr of this.expr) {
      result.push(...expr.keys());
    }
    return result;
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return new ContextKeyAndExpr(
      this.expr.map(expr => expr.map(mapFnc)),
      undefined,
    );
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      const result: ContextKeyExpression[] = [];
      for (const expr of this.expr) {
        result.push(expr.negate());
      }
      this.negated = ContextKeyOrExpr.create(result, this, true)!;
    }
    return this.negated;
  }
}

export class ContextKeyOrExpr implements IContextKeyExpression {
  public static create(
    _expr: ReadonlyArray<ContextKeyExpression | undefined>,
    negated: ContextKeyExpression | undefined,
    extraRedundantCheck: boolean,
  ): ContextKeyExpression | undefined {
    return ContextKeyOrExpr._normalizeArr(_expr, negated, extraRedundantCheck);
  }

  public readonly type = ContextKeyExprType.Or;

  private constructor(
    public readonly expr: ContextKeyExpression[],
    private negated: ContextKeyExpression | undefined,
  ) {}

  public cmp(other: ContextKeyExpression): number {
    if (other.type !== this.type) {
      return this.type - other.type;
    }
    if (this.expr.length < other.expr.length) {
      return -1;
    }
    if (this.expr.length > other.expr.length) {
      return 1;
    }
    for (let i = 0, len = this.expr.length; i < len; i++) {
      const r = cmp(this.expr[i], other.expr[i]);
      if (r !== 0) {
        return r;
      }
    }
    return 0;
  }

  public equals(other: ContextKeyExpression): boolean {
    if (other.type === this.type) {
      if (this.expr.length !== other.expr.length) {
        return false;
      }
      for (let i = 0, len = this.expr.length; i < len; i++) {
        if (!this.expr[i].equals(other.expr[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  public substituteConstants(): ContextKeyExpression | undefined {
    const exprArr = eliminateConstantsInArray(this.expr);
    if (exprArr === this.expr) {
      // no change
      return this;
    }
    return ContextKeyOrExpr.create(exprArr, this.negated, false);
  }

  public evaluate(context: IContext): boolean {
    for (let i = 0, len = this.expr.length; i < len; i++) {
      if (this.expr[i].evaluate(context)) {
        return true;
      }
    }
    return false;
  }

  private static _normalizeArr(
    arr: ReadonlyArray<ContextKeyExpression | undefined>,
    negated: ContextKeyExpression | undefined,
    extraRedundantCheck: boolean,
  ): ContextKeyExpression | undefined {
    let expr: ContextKeyExpression[] = [];
    let hasFalse = false;

    if (arr) {
      for (let i = 0, len = arr.length; i < len; i++) {
        const e = arr[i];
        if (!e) {
          continue;
        }

        if (e.type === ContextKeyExprType.False) {
          // anything || false ==> anything
          hasFalse = true;
          continue;
        }

        if (e.type === ContextKeyExprType.True) {
          // anything || true ==> true
          return ContextKeyTrueExpr.INSTANCE;
        }

        if (e.type === ContextKeyExprType.Or) {
          expr = expr.concat(e.expr);
          continue;
        }

        expr.push(e);
      }

      if (expr.length === 0 && hasFalse) {
        return ContextKeyFalseExpr.INSTANCE;
      }

      expr.sort(cmp);
    }

    if (expr.length === 0) {
      return undefined;
    }

    if (expr.length === 1) {
      return expr[0];
    }

    // eliminate duplicate terms
    for (let i = 1; i < expr.length; i++) {
      if (expr[i - 1].equals(expr[i])) {
        expr.splice(i, 1);
        i--;
      }
    }

    if (expr.length === 1) {
      return expr[0];
    }

    // resolve true OR expressions
    if (extraRedundantCheck) {
      for (let i = 0; i < expr.length; i++) {
        for (let j = i + 1; j < expr.length; j++) {
          if (expr[i].negate().equals(expr[j])) {
            // A || !A case
            return ContextKeyTrueExpr.INSTANCE;
          }
        }
      }

      if (expr.length === 1) {
        return expr[0];
      }
    }

    return new ContextKeyOrExpr(expr, negated);
  }

  public serialize(): string {
    return this.expr.map(e => e.serialize()).join(' || ');
  }

  public keys(): string[] {
    const result: string[] = [];
    for (const expr of this.expr) {
      result.push(...expr.keys());
    }
    return result;
  }

  public map(mapFnc: IContextKeyExprMapper): ContextKeyExpression {
    return new ContextKeyOrExpr(
      this.expr.map(expr => expr.map(mapFnc)),
      undefined,
    );
  }

  public negate(): ContextKeyExpression {
    if (!this.negated) {
      const result: ContextKeyExpression[] = [];
      for (const expr of this.expr) {
        result.push(expr.negate());
      }

      // We don't support parens, so here we distribute the AND over the OR terminals
      // We always take the first 2 AND pairs and distribute them
      while (result.length > 1) {
        const LEFT = result.shift();
        const RIGHT = result.shift();

        const all: ContextKeyExpression[] = [];
        for (const left of getTerminals(LEFT!)) {
          for (const right of getTerminals(RIGHT!)) {
            all.push(ContextKeyAndExpr.create([left, right], undefined, false)!);
          }
        }

        result.unshift(ContextKeyOrExpr.create(all, undefined, false)!);
      }

      this.negated = ContextKeyOrExpr.create(result, this, true);
    }
    return this.negated!;
  }
}

export interface ContextKeyInfo {
  readonly key: string;
  readonly type?: string;
  readonly description?: string;
}

export class RawContextKey<T extends ContextKeyValue> extends ContextKeyDefinedExpr {
  private static _info: ContextKeyInfo[] = [];

  static all(): IterableIterator<ContextKeyInfo> {
    return RawContextKey._info.values();
  }

  private readonly _defaultValue: T | undefined;

  constructor(
    key: string,
    defaultValue: T | undefined,
    metaOrHide?: string | true | { type: string; description: string },
  ) {
    super(key, undefined);
    this._defaultValue = defaultValue;

    // collect all context keys into a central place
    if (typeof metaOrHide === 'object') {
      RawContextKey._info.push({ ...metaOrHide, key });
    } else if (metaOrHide !== true) {
      RawContextKey._info.push({
        key,
        description: metaOrHide,
        type: defaultValue !== undefined ? typeof defaultValue : undefined,
      });
    }
  }

  public bindTo(target: IContextKeyService): IContextKey<T> {
    return target.createKey(this.key, this._defaultValue);
  }

  public getValue(target: IContextKeyService): T | undefined {
    return target.getContextKeyValue<T>(this.key);
  }

  public toNegated(): ContextKeyExpression {
    return this.negate();
  }

  public isEqualTo(value: any): ContextKeyExpression {
    return ContextKeyEqualsExpr.create(this.key, value);
  }

  public notEqualsTo(value: any): ContextKeyExpression {
    return ContextKeyNotEqualsExpr.create(this.key, value);
  }
}

export interface IContextKey<T extends ContextKeyValue = ContextKeyValue> {
  set(value: T): void;
  reset(): void;
  get(): T | undefined;
}

export interface IContextKeyServiceTarget {
  parentElement: IContextKeyServiceTarget | undefined;
  setAttribute(attr: string, value: string): void;
  removeAttribute(attr: string): void;
  hasAttribute(attr: string): boolean;
  getAttribute(attr: string): string | undefined;
}

export interface IReadableSet<T> {
  has(value: T): boolean;
}

export interface IContextKeyChangeEvent {
  affectsSome(keys: IReadableSet<string>): boolean;
  allKeysContainedIn(keys: IReadableSet<string>): boolean;
}

export type IScopedContextKeyService = IContextKeyService & IDisposable;

export interface IContextKeyService {
  readonly _serviceBrand: undefined;

  onDidChangeContext: Event<IContextKeyChangeEvent>;
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  bufferChangeEvents(callback: Function): void;

  createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
  contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
  getContextKeyValue<T>(key: string): T | undefined;

  createScoped(target: IContextKeyServiceTarget): IScopedContextKeyService;
  createOverlay(overlay: Iterable<[string, any]>): IContextKeyService;
  getContext(target: IContextKeyServiceTarget | undefined): IContext;

  updateParent(parentContextKeyService: IContextKeyService): void;
}

function cmp1(key1: string, key2: string): number {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  return 0;
}

function cmp2(key1: string, value1: any, key2: string, value2: any): number {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  if (value1 < value2) {
    return -1;
  }
  if (value1 > value2) {
    return 1;
  }
  return 0;
}

/**
 * Returns true if it is provable `p` implies `q`.
 */
export function implies(p: ContextKeyExpression, q: ContextKeyExpression): boolean {
  if (p.type === ContextKeyExprType.False || q.type === ContextKeyExprType.True) {
    // false implies anything
    // anything implies true
    return true;
  }

  if (p.type === ContextKeyExprType.Or) {
    if (q.type === ContextKeyExprType.Or) {
      // `a || b || c` can only imply something like `a || b || c || d`
      return allElementsIncluded(p.expr, q.expr);
    }
    return false;
  }

  if (q.type === ContextKeyExprType.Or) {
    for (const element of q.expr) {
      if (implies(p, element)) {
        return true;
      }
    }
    return false;
  }

  if (p.type === ContextKeyExprType.And) {
    if (q.type === ContextKeyExprType.And) {
      // `a && b && c` implies `a && c`
      return allElementsIncluded(q.expr, p.expr);
    }
    for (const element of p.expr) {
      if (implies(element, q)) {
        return true;
      }
    }
    return false;
  }

  return p.equals(q);
}

/**
 * Returns true if all elements in `p` are also present in `q`.
 * The two arrays are assumed to be sorted
 */
function allElementsIncluded(p: ContextKeyExpression[], q: ContextKeyExpression[]): boolean {
  let pIndex = 0;
  let qIndex = 0;
  while (pIndex < p.length && qIndex < q.length) {
    const cmp = p[pIndex].cmp(q[qIndex]);

    if (cmp < 0) {
      // an element from `p` is missing from `q`
      return false;
    } else if (cmp === 0) {
      pIndex++;
      qIndex++;
    } else {
      qIndex++;
    }
  }
  return pIndex === p.length;
}

function getTerminals(node: ContextKeyExpression) {
  if (node.type === ContextKeyExprType.Or) {
    return node.expr;
  }
  return [node];
}

function isFalsyOrWhitespace(str: string | undefined): boolean {
  if (!str || typeof str !== 'string') {
    return true;
  }
  return str.trim().length === 0;
}
