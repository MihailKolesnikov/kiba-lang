import { compile, generateKibaAst, generateParserAst } from '../index'
import { Factory } from '../factory'
import { KibaVisitor } from '../factory/nodes'

describe('parser statements tests', () => {
  describe('function declaration', () => {
    it('should generate correct ast for fd without params', async () => {
      const input = `
        fn test() {
          return 1
        }
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.FunctionDeclarationNode(
            'test',
            [
              new Factory.FunctionParametersNode([], Factory.KibaNode.emptyLocation()),
              new Factory.RetExpressionNode(
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

    it('should generate correct ast for fd with one parameter', async () => {
      const input = `
        fn test(a) {
          return a
        }
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.FunctionDeclarationNode(
            'test',
            [
              new Factory.FunctionParametersNode(
                [new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation())],
                Factory.KibaNode.emptyLocation()
              ),
              new Factory.RetExpressionNode(
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

    it('should generate correct ast for fd with many parameters', async () => {
      const input = `
        fn test(a, b, c) {
          return a
        }
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.FunctionDeclarationNode(
            'test',
            [
              new Factory.FunctionParametersNode(
                [
                  new Factory.IdentifierNode('a', [], Factory.KibaNode.emptyLocation()),
                  new Factory.IdentifierNode('b', [], Factory.KibaNode.emptyLocation()),
                  new Factory.IdentifierNode('c', [], Factory.KibaNode.emptyLocation()),
                ],
                Factory.KibaNode.emptyLocation()
              ),
              new Factory.RetExpressionNode(
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

  describe('variable declaration', () => {
    it('should generate correct ast for mutable integer declaration', async () => {
      const input = `
        var int = 1
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'int',
            true,
            [new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for immutable integer declaration', async () => {
      const input = `
        const int = 1
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'int',
            false,
            [new Factory.IntegerNode(1, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for mutable boolean declaration', async () => {
      const input = `
        var bool = true
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'bool',
            true,
            [new Factory.BooleanNode(true, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for immutable boolean declaration', async () => {
      const input = `
        const bool = true
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'bool',
            false,
            [new Factory.BooleanNode(true, [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for mutable string declaration', async () => {
      const input = `
        var str = 'str'
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'str',
            true,
            [new Factory.StringNode('str', [], Factory.KibaNode.emptyLocation())],
            Factory.KibaNode.emptyLocation()
          ),
        ],
        Factory.KibaNode.emptyLocation()
      )

      expect(kibaAst.toObject()).toStrictEqual(expectedAst.toObject())
    })

    it('should generate correct ast for immutable string declaration', async () => {
      const input = `
        const str = 'str'
      `

      const parserAst = await generateParserAst(input)
      const kibaAst = await generateKibaAst(parserAst)

      const expectedAst = new Factory.ProgramNode(
        [
          new Factory.VariableDeclarationNode(
            'str',
            false,
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
        const str = 'str'
        std.print(str)
      `

      const output = await compile(input)

      const stdLibCode = new KibaVisitor().generateStdLibraryCode()

      const stdLibCodeInjected = output.includes(stdLibCode)

      expect(stdLibCodeInjected).toBe(true)
    })

    it('should not inject std-lib code if in code not present access to std object', async () => {
      const input = `
        const str = 'str'
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
})
