export type KibaVisitor = (node: KibaNode) => string

export abstract class KibaNode {
  constructor(public type: string, public children: KibaNode[]) {}

  public is<T extends KibaNode>(constructor: { new (...args: any[]): T }): this is T {
    return this instanceof constructor
  }

  abstract stringRepresentation(): string

  abstract generateCode(visitor: KibaVisitor): string
}

export class ProgramNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('program', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return this.children.map(visitor).join('\n')
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class IntegerNode extends KibaNode {
  constructor(public value: number, children: KibaNode[]) {
    super('integer', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.value}`
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }
}

export class StringNode extends KibaNode {
  constructor(public value: string, children: KibaNode[]) {
    super('string', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `'${this.value}'`
  }

  stringRepresentation(): string {
    return `${this.type}: '${this.value}'`
  }
}

export class BooleanNode extends KibaNode {
  constructor(public value: boolean, children: KibaNode[]) {
    super('boolean', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.value}`
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }
}

export class ObjectPropertyDeclarationNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('object property declaration', children)
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
  constructor(children: KibaNode[]) {
    super('object', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `{ ${this.children.map(visitor)} }`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class IdentifierNode extends KibaNode {
  private static stdMethodsMap = new Map([['print', 'console.log']])

  constructor(public value: string, children: KibaNode[]) {
    super('identifier', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return this.mapIfStdMethodOrGetValue()
  }

  stringRepresentation(): string {
    return `${this.type}: ${this.value}`
  }

  isStdAccessNode = (): boolean => this.value === 'std'

  mapIfStdMethodOrGetValue = (): string => {
    if (IdentifierNode.stdMethodsMap.has(this.value)) {
      return IdentifierNode.stdMethodsMap.get(this.value)!
    }

    return this.value
  }
}

export class VariableDeclarationNode extends KibaNode {
  constructor(
    public type: string,
    public name: string,
    public mutable: boolean,
    children: KibaNode[]
  ) {
    super('variable declaration', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.mutable ? 'let' : 'const'} ${this.name} = ${this.children.map(visitor)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class FunctionDeclarationNode extends KibaNode {
  constructor(public name: string, children: KibaNode[]) {
    super('function declaration', children)
  }

  generateCode(visitor: KibaVisitor): string {
    const [params, ...children] = this.children

    return [
      `function ${this.name}(${params.generateCode(visitor)}) {`,
      `  ${children.map(visitor).join('\n  ')}`,
      '}',
    ].join('\n')
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class FunctionParametersNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('function parameters', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.children.map(visitor).join(', ')}`
  }

  stringRepresentation(): string {
    return `${this.type}`
  }
}

export class FunctionArgumentsNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('function arguments', children)
  }

  generateCode(visitor: KibaVisitor): string {
    return `${this.children.map(visitor).join(', ')}`
  }

  stringRepresentation(): string {
    return `${this.type}`
  }
}

export class CallExpressionNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('call expression', children)
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
  constructor(public operator: string, children: KibaNode[]) {
    super('binary expression', children)
  }

  generateCode(visitor: KibaVisitor): string {
    const [left, right] = this.children

    return `${visitor(left)} ${this.operator} ${visitor(right)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class PropertyAccessExpressionNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('property access expression', children)
  }

  generateCode(visitor: KibaVisitor): string {
    const [left, right] = this.children

    if (left.is(IdentifierNode) && left.isStdAccessNode()) {
      return visitor(right)
    }

    return `${visitor(left)}.${visitor(right)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}

export class RetExpressionNode extends KibaNode {
  constructor(children: KibaNode[]) {
    super('return expression', children)
  }

  generateCode = (visitor: KibaVisitor) => {
    return `return ${this.children.map(visitor)}`
  }

  stringRepresentation(): string {
    return this.type
  }
}
