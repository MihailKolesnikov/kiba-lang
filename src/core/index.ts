import * as Factory from './factory'
import { ParserNode, ParserNodeTypes } from './parser/types'
import parser from './parser'

function wrapToProgramNode(parserOutput: any): ParserNode {
  if (Array.isArray(parserOutput)) {
    return { type: 'program', children: [...parserOutput] }
  }

  return { type: 'program', children: parserOutput }
}

function parserVisitor(program: ParserNode): Factory.KibaNode {
  function visit(node: ParserNode): Factory.KibaNode {
    if (node.type === ParserNodeTypes.fnDeclaration) {
      return new Factory.FunctionDeclarationNode(node.name, node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.fnParams) {
      return new Factory.FunctionParametersNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.fnArgs) {
      return new Factory.FunctionArgumentsNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.variableDeclaration) {
      console.log(node)
      return new Factory.VariableDeclarationNode(
        node.variableType,
        node.variableName,
        node.mutable,
        node.children.map(visit)
      )
    }

    if (node.type === ParserNodeTypes.string) {
      return new Factory.StringNode(node.value, [])
    }

    if (node.type === ParserNodeTypes.integer) {
      return new Factory.IntegerNode(node.value, [])
    }

    if (node.type === ParserNodeTypes.boolean) {
      return new Factory.BooleanNode(node.value, [])
    }

    if (node.type === ParserNodeTypes.object) {
      return new Factory.ObjectNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.objectPropertyDeclaration) {
      return new Factory.ObjectPropertyDeclarationNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.identifier) {
      return new Factory.IdentifierNode(node.value, [])
    }

    if (node.type === ParserNodeTypes.callExpression) {
      return new Factory.CallExpressionNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.binaryExpression) {
      return new Factory.BinaryExpressionNode(node.operator, node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.propertyAccessExpression) {
      return new Factory.PropertyAccessExpressionNode(node.children.map(visit))
    }

    if (node.type === ParserNodeTypes.returnExpression) {
      return new Factory.RetExpressionNode(node.children.map(visit))
    }

    console.log('unknown node:', node)
    throw new Error(`unknown node type: ${node.type}`)
  }

  return new Factory.ProgramNode(program.children.map(visit))
}

function kibaVisitor(program: Factory.KibaNode): string {
  const visit = (node: Factory.KibaNode): string => node.generateCode(visit)

  return program.generateCode(visit)
}

export async function generateParserAst(input: string): Promise<ParserNode> {
  return wrapToProgramNode(parser.parse(input))
}

export async function generateKibaAst(parserAst: ParserNode) {
  return parserVisitor(parserAst)
}

export async function compile(input: string): Promise<string> {
  return generateParserAst(input).then(generateKibaAst).then(kibaVisitor)
}
