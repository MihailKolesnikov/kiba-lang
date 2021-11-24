import { createEffect, createEvent, createStore, sample } from 'effector'
import { generateKibaAst, generateParserAst, compile } from '../core'
import * as Factory from '../core/factory'

export const inputChanged = createEvent<string>()

export const generateAst = createEvent()

export const compileSourceCode = createEvent()

export const $input = createStore(
  `
fn identity(a) {
  return a
}

std.print(identity(1))
`.trim()
)

export const $ast = createStore(new Factory.ProgramNode([]))

export const $compiledCode = createStore('')

const generateAstFx = createEffect((input: string) =>
  generateParserAst(input).then(generateKibaAst)
)

const compileFx = createEffect(async (input: string) => {
  const ast = await generateAstFx(input)
  const code = await compile(input)

  return { ast, code }
})

$input.on(inputChanged, (_, input) => input)

$ast.on(generateAstFx.doneData, (_, ast) => ast).on(compileFx.doneData, (_, { ast }) => ast)

$compiledCode.on(compileFx.doneData, (_, { code }) => code)

sample({
  source: $input,
  clock: generateAst,
  target: generateAstFx,
})

sample({
  source: $input,
  clock: compileSourceCode,
  target: compileFx,
})

generateAstFx.failData.watch(console.error)
compileFx.failData.watch(console.error)
