import { compile, generateKibaAst, generateParserAst } from '../index'
import { Factory } from '../factory'
import { KibaVisitor } from '../factory/nodes'

describe('parser statements tests', () => {
  describe('named function expression', () => {
    it('should generate correct ast for nfe without params', async () => {
      const input = `
        let test = () -> 1
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.NamedFnExpressionNode(
            [
              new Factory.IdentifierNode('test', [], Factory.KibaNode.emptyLocation()),
              new Factory.FunctionParametersNode([], Factory.KibaNode.emptyLocation()),
              new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation()),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for nfe with one parameter', async () => {
      const input = `
        let test = (a) -> a
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.NamedFnExpressionNode(
            [
              new Factory.IdentifierNode('test', [], Factory.KibaNode.emptyLocation()),
              new Factory.FunctionParametersNode(
                [new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation())],
                Factory.KibaNode.emptyLocation()
              ),
              new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation()),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for nfe with many parameters', async () => {
      const input = `
        let test = (a, b, c) -> a
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.NamedFnExpressionNode(
            [
              new Factory.IdentifierNode('test', [], Factory.KibaNode.emptyLocation()),
              new Factory.FunctionParametersNode(
                [
                  new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation()),
                  new Factory.IdentifierNode('b', [], Factory.KibaNode.emptyLocation()),
                  new Factory.IdentifierNode('c', [], Factory.KibaNode.emptyLocation()),
                ],
                Factory.KibaNode.emptyLocation()
              ),
              new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation()),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })
  })

  describe('variable declaration', () => {
    it('should generate correct ast for integer declaration', async () => {
      const input = `
        let int = 1
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'int',
            [new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for boolean declaration', async () => {
      const input = `
        let bool = true
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'bool',
            [new Factory.BooleanNode(true, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for string declaration', async () => {
      const input = `
        let str = 'str'
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'str',
            [new Factory.StringNode('str', [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })
  })

  describe('std library code injection', () => {
    it('should inject std-lib code if in code present access to std object', async () => {
      const input = `
        let str = 'str'
        std.print(str)
      `

      const output = await compile(input)

      const stdLibCode = new KibaVisitor().generateStdLibraryCode()

      const stdLibCodeInjected = output.includes(stdLibCode)

      expect(stdLibCodeInjected).toBe(true)
    })

    it('should not inject std-lib code if in code not present access to std object', async () => {
      const input = `
        let str = 'str'
      `

      const output = await compile(input)

      const stdLibCode = new KibaVisitor().generateStdLibraryCode()

      const stdLibCodeInjected = output.includes(stdLibCode)

      expect(stdLibCodeInjected).toBe(false)
    })
  })

  describe('call expression', () => {
    it('should generate correct ast for call expression', async () => {
      const input = `
        identity(a)
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.CallExpressionNode(
            [
              new Factory.IdentifierNode('identity', [], Factory.KibaNode.emptyLocation()),
              new Factory.FunctionArgumentsNode(
                [new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation())],
                Factory.KibaNode.emptyLocation()
              ),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })
  })

  describe('arrays', () => {
    it('should generate correct ast for array of zero elements', async () => {
      const input = `
        let a = []
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'a',
            [new Factory.ArrayNode([], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for array of one element', async () => {
      const input = `
        let a = [1]
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'a',
            [
              new Factory.ArrayNode(
                [new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation())],
                Factory.KibaNode.emptyLocation()
              ),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for array [1, 2, 3]', async () => {
      const input = `
        let a = [1, 2, 3]
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'a',
            [
              new Factory.ArrayNode(
                [
                  new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation()),
                  new Factory.IntegerNode(2, [], Factory.KibaNode.emptyLocation()),
                  new Factory.IntegerNode(3, [], Factory.KibaNode.emptyLocation()),
                ],
                Factory.KibaNode.emptyLocation()
              ),
            ],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })
  })
})
