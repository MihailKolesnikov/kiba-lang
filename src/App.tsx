import React, { useCallback, useState } from 'react'
import * as model from './model'
import { useStore } from 'effector-react'
import styles from './App.module.scss'
import { Factory } from './core/factory'

export const App = () => {
  const input = useStore(model.$input)
  const astRootNode = useStore(model.$ast)
  const compiledCode = useStore(model.$compiledCode)

  return (
    <div className={styles.app}>
      <div className={styles.controls}>
        <button onClick={() => model.generateAst()}>generate ast</button>
        <button onClick={() => model.compileSourceCode()}>compile</button>
      </div>
      <div className={styles.verticalAreas}>
        <textarea value={input} onChange={(e) => model.inputChanged(e.target.value)} />
        <div className={styles.horizontalAreas}>
          <Ast node={astRootNode} />
          <textarea value={compiledCode} disabled />
        </div>
      </div>
    </div>
  )
}

const Ast = (props: { node: Factory.KibaNode }) => <TreeItem node={props.node} opened />

const TreeItem = (props: { node: Factory.KibaNode; opened: boolean }) => {
  const [isOpened, setIsOpened] = useState(props.opened)

  const toggleOpen = useCallback(() => setIsOpened((state) => !state), [])

  return (
    <div>
      <div>
        {props.node.children.length > 0 && (
          <span onClick={toggleOpen} style={{ marginRight: '5px' }}>
            {isOpened ? '-' : '+'}
          </span>
        )}
        <span>{props.node.stringRepresentation()}</span>
      </div>
      {isOpened && (
        <div style={{ marginLeft: '15px' }}>
          {props.node.children.map((child, key) => (
            <TreeItem key={key} node={child} opened={false} />
          ))}
        </div>
      )}
    </div>
  )
}
