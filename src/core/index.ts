import { ParserNode, ParserNodeTypes } from './parser/types'
import parser from './parser'
import { Factory } from './factory'
import { Analyzer } from './analyzer'
import { VariableNotDefinedRule } from './analyzer/rules'

function wrapToProgramNode(parserOutput: any): ParserNode {
  if (Array.isArray(parserOutput)) {
    return {
      type: 'program',
      children: [...parserOutput],
      location: Factory.KibaNode.emptyLocation(),
    }
  }

  return { type: 'program', children: parserOutput, location: Factory.KibaNode.emptyLocation() }
}

function parserVisitor(program: ParserNode): Factory.KibaNode {
  function visit(node: ParserNode): Factory.KibaNode {
    if (node.type === ParserNodeTypes.namedFnExpression) {
      return new Factory.NamedFnExpressionNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.anonymousFnExpression) {
      return new Factory.AnonymousFnExpressionNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.fnParams) {
      return new Factory.FunctionParametersNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.fnArgs) {
      return new Factory.FunctionArgumentsNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.variableDeclaration) {
      return new Factory.VariableDeclarationNode(node.variableName, node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.void) {
      return new Factory.VoidNode([], node.location)
    }

    if (node.type === ParserNodeTypes.string) {
      return new Factory.StringNode(node.value, [], node.location)
    }

    if (node.type === ParserNodeTypes.integer) {
      return new Factory.IntegerNode(node.value, [], node.location)
    }

    if (node.type === ParserNodeTypes.boolean) {
      return new Factory.BooleanNode(node.value, [], node.location)
    }

    if (node.type === ParserNodeTypes.object) {
      return new Factory.ObjectNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.objectPropertyDeclaration) {
      return new Factory.ObjectPropertyDeclarationNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.array) {
      return new Factory.ArrayNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.identifier) {
      return new Factory.IdentifierNode(node.value, [], node.location)
    }

    if (node.type === ParserNodeTypes.callExpression) {
      return new Factory.CallExpressionNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.openParen) {
      return new Factory.OpenParenNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.closeParen) {
      return new Factory.CloseParenNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.binaryOperator) {
      return new Factory.BinaryOperatorNode(node.value, node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.binaryExpression) {
      return new Factory.BinaryExpressionNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.propertyAccessExpression) {
      return new Factory.PropertyAccessExpressionNode(node.children.map(visit), node.location)
    }

    if (node.type === ParserNodeTypes.returnExpression) {
      return new Factory.RetExpressionNode(node.children.map(visit), node.location)
    }

    console.log('unknown node:', node)
    throw new Error(`unknown node type: ${node.type}`)
  }

  return new Factory.ProgramNode(program.children.map(visit), program.location)
}

function kibaVisitor(program: Factory.KibaNode): string {
  const visitor = new Factory.KibaVisitor()

  const generatedOutput = visitor.visit(program)

  if (visitor.hasStdAccess) {
    return visitor.generateStdLibraryCode() + generatedOutput
  }

  return generatedOutput
}

export async function generateParserAst(input: string): Promise<ParserNode> {
  return wrapToProgramNode(parser.parse(input))
}

export async function generateKibaAst(parserAst: ParserNode): Promise<Factory.ProgramNode> {
  return parserVisitor(parserAst)
}

export async function compile(program: Factory.ProgramNode): Promise<string> {
  return kibaVisitor(program)
}

export async function analyze(program: Factory.ProgramNode): Promise<void> {
  const analyzer = new Analyzer()

  analyzer.addRule(Factory.IdentifierNode, new VariableNotDefinedRule())

  const scope = await analyzer.createProgramScope(program)

  const errors = analyzer.process(scope)

  if (errors.length > 0) {
    throw errors
  }
}
