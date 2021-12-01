export class KibaVisitor {
  public hasStdAccess: boolean = false

  includeStdLibraryCode() {
    this.hasStdAccess = true
  }

  generateStdLibraryCode(): string {
    return '// std-library-code\nconst std = { print: console.log }\n//end of std-library-code\n'
  }

  public visit = (node: KibaNode): string => node.generateCode(this)
}

export type NodeLocation = {
  start: { offset: number; line: number; column: number }
  end: { offset: number; line: number; column: number }
}

export abstract class KibaNode {
  constructor(public type: string, public children: KibaNode[], public location: NodeLocation) {}

  public is<T extends KibaNode>(constructor: { new (...args: any[]): T }): this is T {
    return this instanceof constructor
  }

  static emptyLocation(): NodeLocation {
    return { start: { offset: 0, column: 0, line: 0 }, end: { offset: 0, column: 0, line: 0 } }
  }

  public toObject(): Object {
    const plainObject: { [key: string]: any } = {
      ...this,
      _type: this.type,
      children: this.children.map((c) => c.toObject()),
    }

    delete plainObject.type
    delete plainObject.location

    return plainObject
  }

  abstract stringRepresentation(): string

  abstract generateCode(visitor: KibaVisitor): string
}

export class ProgramNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('program', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return this.children.map(visitor.visit).join('\n')
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class IntegerNode extends KibaNode {
  constructor(public value: number, children: KibaNode[], location: NodeLocation) {
    super('integer', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.value}`
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }
}

export class StringNode extends KibaNode {
  constructor(public value: string, children: KibaNode[], location: NodeLocation) {
    super('string', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `'${this.value}'`
  }

  stringRepresentation(): string {
    return `${this.type}: '${this.value}'`
  }
}

export class VoidNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('void', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return 'undefined'
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class BooleanNode extends KibaNode {
  constructor(public value: boolean, children: KibaNode[], location: NodeLocation) {
    super('boolean', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.value}`
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }
}

export class ObjectPropertyDeclarationNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('object property declaration', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [name, value] = this.children
    return `${name.generateCode(visitor)}: ${value.generateCode(visitor)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class ObjectNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('object', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `{ ${this.children.map(visitor.visit)} }`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class IdentifierNode extends KibaNode {
  constructor(public value: string, children: KibaNode[], location: NodeLocation) {
    super('identifier', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return this.value
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }

  isStdAccessNode(): boolean {
    return this.value === 'std'
  }
}

export class VariableDeclarationNode extends KibaNode {
  constructor(
    public name: string,
    public mutable: boolean,
    children: KibaNode[],
    location: NodeLocation
  ) {
    super('variable declaration', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.mutable ? 'let' : 'const'} ${this.name} = ${this.children.map(visitor.visit)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class FunctionDeclarationNode extends KibaNode {
  constructor(public name: string, children: KibaNode[], location: NodeLocation) {
    super('function declaration', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [params, ...children] = this.children

    return [
      `function ${this.name}(${params.generateCode(visitor)}) {`,
      `  ${children.map(visitor.visit).join('\n  ')}`,
      '}',
    ].join('\n')
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class NamedFnExpressionNode extends KibaNode {
  constructor(public name: string, children: KibaNode[], location: NodeLocation) {
    super('named fn expression', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [name, params, ...children] = this.children

    const mayBeReturnExpression = children[children.length - 1]

    if (mayBeReturnExpression.is(RetExpressionNode)) {
      return [
        `const ${name.generateCode(visitor)} = (${params.generateCode(visitor)}) => {`,
        `  ${children.map(visitor.visit).join('\n  ')}`,
        '}',
      ].join('\n')
    }

    return [
      `const ${name.generateCode(visitor)} = (${params.generateCode(visitor)}) => ${children
        .map(visitor.visit)
        .join('\n  ')}`,
    ].join('\n')
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class AnonymousFnExpressionNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('anonymous fn expression', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [params, ...children] = this.children

    const mayBeReturnExpression = children[children.length - 1]

    if (mayBeReturnExpression.is(RetExpressionNode)) {
      return [
        `(${params.generateCode(visitor)}) => {`,
        `  ${children.map(visitor.visit).join('\n  ')}`,
        '}',
      ].join('\n')
    }

    return `(${params.generateCode(visitor)}) => ${children.map(visitor.visit).join('\n  ')}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class FunctionParametersNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('function parameters', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.children.map(visitor.visit).join(', ')}`
  }

  stringRepresentation(): string {
    return `${this.type}`
  }
}

export class FunctionArgumentsNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('function arguments', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.children.map(visitor.visit).join(', ')}`
  }

  stringRepresentation(): string {
    return `${this.type}`
  }
}

export class CallExpressionNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('call expression', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [name, args] = this.children

    return `${name.generateCode(visitor)}(${args.generateCode(visitor)})`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class BinaryExpressionNode extends KibaNode {
  constructor(public operator: string, children: KibaNode[], location: NodeLocation) {
    super('binary expression', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [left, right] = this.children

    return `${visitor.visit(left)} ${this.operator} ${visitor.visit(right)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class PropertyAccessExpressionNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('property access expression', children, location)
  }

  generateCode(visitor: KibaVisitor): string {
    const [left, right] = this.children

    if (left.is(IdentifierNode) && left.isStdAccessNode()) {
      visitor.includeStdLibraryCode()
    }

    return `${visitor.visit(left)}.${visitor.visit(right)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class RetExpressionNode extends KibaNode {
  constructor(children: KibaNode[], location: NodeLocation) {
    super('return expression', children, location)
  }

  generateCode(visitor: KibaVisitor) {
    return `return ${this.children.map(visitor.visit)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}
