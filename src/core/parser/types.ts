export enum ParserNodeTypes {
  variableDeclaration = 'variable declaration',
  void = 'void',
  string = 'string',
  integer = 'integer',
  boolean = 'boolean',
  identifier = 'identifier',
  object = 'object',
  openParen = 'openParen',
  closeParen = 'closeParen',
  fnDeclaration = 'fnDeclaration',
  namedFnExpression = 'namedFnExpression',
  anonymousFnExpression = 'anonymousFnExpression',
  fnParams = 'fnParams',
  fnArgs = 'fnArgs',
  callExpression = 'callExpression',
  binaryOperator = 'binaryOperator',
  binaryExpression = 'binaryExpression',
  propertyAccessExpression = 'propertyAccessExpression',
  objectPropertyDeclaration = 'objectPropertyDeclaration',
  returnExpression = 'returnExpression',
}

export type ParserNode = { [key: string]: any } & { type: string; children: ParserNode[] }
