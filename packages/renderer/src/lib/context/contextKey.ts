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
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { LexingError, Token } from './scanner.js';
import { Scanner, TokenType } from './scanner.js';
import type { ContextKeyValue, IContext } from '../../../../main/src/plugin/api/context-info.js';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const enum ContextKeyExprType {
  In = 10,
  NotIn = 11,
}

export interface IContextKeyExprMapper {
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

export type ContextKeyExpression = ContextKeyInExpr | ContextKeyNotInExpr;

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
const hintEmptyString =
  'Did you forget to write an expression? You can also put "false" or "true" to always evaluate to false or true, respectively.';
const errorNoInAfterNot = '"in" after "not".';
const errorClosingParenthesis = 'closing parenthesis ")"';
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

    return expr.length === 1 ? expr[0] : undefined;
  }

  private _and(): ContextKeyExpression | undefined {
    const expr = [this._term()];

    return expr.length === 1 ? expr[0] : undefined;
  }

  private _term(): ContextKeyExpression | undefined {
    return this._primary();
  }

  private _primary(): ContextKeyExpression | undefined {
    const peek = this._peek();
    switch (peek.type) {
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

        // [ 'not' 'in' value ]
        if (this._matchOne(TokenType.Not)) {
          this._consume(TokenType.In, errorNoInAfterNot);
          const right = this._value();
          return ContextKeyExpr.notIn(key, right);
        }

        // [ ('in') value ]
        const maybeOp = this._peek().type;
        if (maybeOp === TokenType.In) {
          this._advance();
          return ContextKeyExpr.in(key, this._value());
        } else {
          this._parsingErrors.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: '' });
          throw Parser._parseError;
        }
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
          "true | false | KEY \n\t| KEY '=~' REGEX \n\t| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value",
          this._peek(),
        );
    }
  }

  private _value(): string {
    const token = this._peek();
    switch (token.type) {
      case TokenType.Str:
      case TokenType.QuotedStr:
        this._advance();
        return token.lexeme;
      case TokenType.In: // we support `in` as a value, e.g., "when": "languageId == in" - exists in existing extensions
        this._advance();
        return 'in';
      default:
        // this allows "when": "foo == " which's used by existing extensions
        // we do not call `_advance` on purpose - we don't want to eat unintended tokens
        return '';
    }
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
  public static in(key: string, value: string): ContextKeyExpression {
    return ContextKeyInExpr.create(key, value);
  }
  public static notIn(key: string, value: string): ContextKeyExpression {
    return ContextKeyNotInExpr.create(key, value);
  }

  private static _parser = new Parser({ regexParsingWithErrorRecovery: false });
  public static deserialize(serialized: string | null | undefined): ContextKeyExpression | undefined {
    if (serialized === undefined || serialized === null) {
      // an empty string needs to be handled by the parser to get a corresponding parsing error reported
      return undefined;
    }

    return this._parser.parse(serialized);
  }
}

export class ContextKeyInExpr implements IContextKeyExpression {
  public static create(key: string, valueKey: string): ContextKeyInExpr {
    return new ContextKeyInExpr(key, valueKey);
  }

  public readonly type = ContextKeyExprType.In;
  private negated: ContextKeyExpression | null = null;

  private constructor(private readonly key: string, private readonly valueKey: string) {}

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

    if (typeof item === 'string' && typeof source === 'object' && source !== null) {
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

  private constructor(private readonly key: string, private readonly valueKey: string) {
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

export interface IContextKey<T extends ContextKeyValue = ContextKeyValue> {
  set(value: T): void;
  reset(): void;
  get(): T | undefined;
}

export interface IContextKeyServiceTarget {
  parentElement: IContextKeyServiceTarget | null;
  setAttribute(attr: string, value: string): void;
  removeAttribute(attr: string): void;
  hasAttribute(attr: string): boolean;
  getAttribute(attr: string): string | null;
}

export interface IReadableSet<T> {
  has(value: T): boolean;
}

export interface IContextKeyChangeEvent {
  affectsSome(keys: IReadableSet<string>): boolean;
  allKeysContainedIn(keys: IReadableSet<string>): boolean;
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
