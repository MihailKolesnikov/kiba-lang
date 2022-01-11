import { Factory } from '../../factory'
import { isNodeOfType } from '../../factory/nodes'
import { Scope } from '../scope'

export type RuleResult = { message: string }

export interface Rule<T extends Factory.KibaNode> {
  process(node: T, scope: Scope): RuleResult | undefined
}

export class VariableNotDefinedRule implements Rule<Factory.IdentifierNode> {
  public process = (node: Factory.IdentifierNode, scope: Scope): RuleResult | undefined => {
    const inScope = (node: Factory.IdentifierNode, scope: Scope) => {
      return scope.variableDeclarations.some((variableDeclaration) => variableDeclaration.name === node.value)
    }

    const isFunctionParameter = (node: Factory.IdentifierNode, scope: Scope) => {
      if (scope.parameters === null) {
        return false
      }

      return scope.parameters.children.filter(isNodeOfType(Factory.IdentifierNode)).some((c) => c.value === node.value)
    }

    const isFunctionName = (node: Factory.IdentifierNode, scope: Scope) => {
      if (isNodeOfType(Factory.NamedFnExpressionNode)(scope.context)) {
        return scope.context.children.filter(isNodeOfType(Factory.IdentifierNode)).some((c) => c.value === node.value)
      }

      return false
    }

    const visit = (scope: Scope | null): boolean => {
      if (scope === null) {
        return false
      }

      if (inScope(node, scope) || isFunctionParameter(node, scope) || isFunctionName(node, scope)) {
        return true
      }

      return visit(scope.parent)
    }

    const isNotDefined = !visit(scope)

    if (isNotDefined) {
      return {
        message: `Error on line ${node.location.start.line}: ${node.value} is not defined`,
      }
    }
  }
}
