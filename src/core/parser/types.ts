export enum ParserNodeTypes {
  variableDeclaration = 'variable declaration',
  string = 'string',
  integer = 'integer',
  boolean = 'boolean',
  identifier = 'identifier',
  object = 'object',
  fnDeclaration = 'fnDeclaration',
  fnParams = 'fnParams',
  fnArgs = 'fnArgs',
  callExpression = 'callExpression',
  binaryExpression = 'binaryExpression',
  propertyAccessExpression = 'propertyAccessExpression',
  objectPropertyDeclaration = 'objectPropertyDeclaration',
  returnExpression = 'returnExpression',
}

export type ParserNode = { [key: string]: any } & { type: string; children: ParserNode[] }
