import { Factory } from '../factory'
import { isNodeOfType, KibaNodeConstructor } from '../factory/nodes'
import { Scope, ScopeFactory } from './scope'
import { Rule, RuleResult } from './rules'

export class Analyzer {
  private scopeFactory = new ScopeFactory()
  private rules = new Map<KibaNodeConstructor<Factory.KibaNode>, Array<Rule<Factory.KibaNode>>>()

  public addRule = (appliesTo: KibaNodeConstructor<Factory.KibaNode>, rule: Rule<Factory.KibaNode>): void => {
    const hasRulesForNodeType = this.rules.has(appliesTo)

    if (hasRulesForNodeType) {
      this.rules.get(appliesTo)!.push(rule)
      return
    }

    this.rules.set(appliesTo, [rule])
  }

  async createProgramScope(program: Factory.ProgramNode): Promise<Scope> {
    return this.scopeFactory.createProgramScope(program)
  }

  public process = (scope: Scope): RuleResult[] => {
    const result: RuleResult[] = []
    const visitedNodesIds = new Set<Factory.KibaNode>()

    const visitNode = (node: Factory.KibaNode, scope: Scope): void => {
      node.children.forEach((c) => visitNode(c, scope))

      if (visitedNodesIds.has(node)) {
        return
      }

      visitedNodesIds.add(node)

      const isTypeForRule = (type: KibaNodeConstructor<Factory.KibaNode>) => isNodeOfType(type)(node)
      const rulesForNodeType = (type: KibaNodeConstructor<Factory.KibaNode>) => this.rules.get(type)
      const processRule = (rule: Rule<Factory.KibaNode>) => rule.process(node, scope)
      const notUndefined = <T>(arg: T): arg is Exclude<T, undefined> => arg !== undefined

      for (const nodeType of this.rules.keys()) {
        if (isTypeForRule(nodeType)) {
          result.push(...rulesForNodeType(nodeType)!.map(processRule).filter(notUndefined))
        }
      }
    }

    const visitScope = (scope: Scope): void => {
      scope.children.forEach(visitScope)

      visitNode(scope.context, scope)
    }

    visitScope(scope)

    return result
  }
}
