export enum ParserNodeTypes {
  variableDeclaration = 'variable declaration',
  void = 'void',
  string = 'string',
  integer = 'integer',
  boolean = 'boolean',
  identifier = 'identifier',
  object = 'object',
  fnDeclaration = 'fnDeclaration',
  namedFnExpression = 'namedFnExpression',
  anonymousFnExpression = 'anonymousFnExpression',
  fnParams = 'fnParams',
  fnArgs = 'fnArgs',
  callExpression = 'callExpression',
  binaryExpression = 'binaryExpression',
  propertyAccessExpression = 'propertyAccessExpression',
  objectPropertyDeclaration = 'objectPropertyDeclaration',
  returnExpression = 'returnExpression',
}

export type ParserNode = { [key: string]: any } & { type: string; children: ParserNode[] }
