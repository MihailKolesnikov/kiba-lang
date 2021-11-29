import { Factory } from '../factory'
import { KibaNode } from '../factory/nodes'

const notUndefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined

export class Scope {
  constructor(public node: KibaNode, public children: Scope[]) {}

  static createScope(program: Factory.ProgramNode): Scope {
    const types = [Factory.FunctionDeclarationNode]

    function visit(node: KibaNode): Scope | undefined {
      const typeMatched = types.some((t) => node.is(t))

      if (typeMatched) {
        return new Scope(node, node.children.map(visit).filter(notUndefined))
      }
    }

    return new Scope(program, program.children.map(visit).filter(notUndefined))
  }
}
