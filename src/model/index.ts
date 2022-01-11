import { createEffect, createEvent, createStore, sample } from 'effector'
import { generateKibaAst, generateParserAst, compile, analyze } from '../core'
import { Factory } from '../core/factory'
import { RuleResult } from '../core/analyzer/rules'

export const inputChanged = createEvent<string>()

export const compileSourceCode = createEvent()

export const $input = createStore(
  `
let b = 228

let kek = (a) -> {
  let c = () -> a + b
  return void
}
`.trim()
)

export const $ast = createStore(new Factory.ProgramNode([], Factory.KibaNode.emptyLocation()))

export const $compiledCode = createStore('')

const generateAstFx = createEffect((input: string) => generateParserAst(input).then(generateKibaAst))

const analyzeFx = createEffect<Factory.ProgramNode, void, RuleResult[]>(analyze)

const compileFx = createEffect(compile)

$input.on(inputChanged, (_, input) => input)

$ast.on(generateAstFx.doneData, (_, ast) => ast).reset(compileSourceCode)

$compiledCode
  .on(compileFx.doneData, (_, code) => code)
  .on([compileFx.failData, generateAstFx.failData], (_, e) => e.message)
  .on(analyzeFx.failData, (_, errors) => errors.map((e) => e.message).join('\n'))
  .reset(compileSourceCode)

sample({
  source: $input,
  clock: compileSourceCode,
  target: generateAstFx,
})

sample({
  source: generateAstFx.doneData,
  target: analyzeFx,
})

sample({
  source: generateAstFx.doneData,
  clock: analyzeFx.doneData,
  target: compileFx,
})

generateAstFx.failData.watch(console.error)
compileFx.failData.watch(console.error)
analyzeFx.failData.watch(console.error)
