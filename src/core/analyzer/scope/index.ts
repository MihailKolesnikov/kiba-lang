import { Factory } from '../../factory'
import { isNodeOfType } from '../../factory/nodes'

type NodeFormingScope = Factory.NamedFnExpressionNode | Factory.AnonymousFnExpressionNode

export class ScopeFactory {
  public createProgramScope = (program: Factory.ProgramNode): Scope => this.visitor(program)

  private visitor = (program: Factory.ProgramNode): Scope => {
    const nodeFormingScope = (node: Factory.KibaNode): node is NodeFormingScope => {
      return isNodeOfType(Factory.NamedFnExpressionNode)(node) || isNodeOfType(Factory.AnonymousFnExpressionNode)(node)
    }

    const findChildNodesOfType = <NodeType extends Factory.KibaNode>(
      context: Factory.KibaNode,
      nodeType: Factory.KibaNodeConstructor<NodeType>
    ): NodeType[] => {
      return context.children.filter(isNodeOfType(nodeType))
    }

    const createScope = (node: Factory.KibaNode, parentScope: Scope | null): Scope => {
      const variableDeclarations = findChildNodesOfType(node, Factory.VariableDeclarationNode)
      const parameters = findChildNodesOfType(node, Factory.FunctionParametersNode)[0] ?? null

      const scope = new Scope(node, parentScope, [], variableDeclarations, parameters)

      scope.children = visit(node, scope)

      return scope
    }

    const visit = (node: Factory.KibaNode, parentScope: Scope | null): Scope[] => {
      return node.children.filter(nodeFormingScope).map((node) => createScope(node, parentScope))
    }

    return createScope(program, null)
  }
}

export class Scope {
  constructor(
    public context: Factory.KibaNode,
    public parent: Scope | null,
    public children: Scope[],
    public variableDeclarations: Factory.VariableDeclarationNode[],
    public parameters: Factory.FunctionParametersNode | null
  ) {}
}
