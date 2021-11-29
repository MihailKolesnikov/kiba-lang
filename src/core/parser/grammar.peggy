{
    const nodeLocation = () => {
        const loc = location()
        return { start: loc.start, end: loc.end }
    }
}

start
    = program

  program = statement+

  statement = fnDeclaration / variableDeclaration / expression

  // functions

  fnArgsEnumeration
    = _ comma _ value:variableValue _ { return value }

  fnArgs
    = value:variableValue others:fnArgsEnumeration* { return { type: 'fnArgs', children: [value, ...others], location: nodeLocation() } }
    / _ value:variableValue* _ { return { type: 'fnArgs', children: value, location: nodeLocation() } }

  fnParamsEnumeration
    = _ comma _ param:identifier _ { return param }

  fnParams
    = params:identifier others:fnParamsEnumeration* { return { type: 'fnParams', children: [params, ...others], location: nodeLocation() } }
    / params:identifier* { return { type: 'fnParams', children: params, location: nodeLocation() } }

  returnExpression
    = _ ret:returnKeyword _ expr:expression _ {
      return { type: 'returnExpression', children: [expr], location: nodeLocation() }
    }
    / _ ret:returnKeyword _ expr:variableValue _ {
      return { type: 'returnExpression', children: [expr], location: nodeLocation() }
    }

  fnDeclaration
    = _ fnKeyword _ name:identifier _ openParen _ params:fnParams _ closeParen _ blockOpenParen _
        body:statement*
        retExpr:returnExpression
      _ blockCloseParen _ {
      return { type: 'fnDeclaration', name: name.value, children: [params, ...body, retExpr], location: nodeLocation() }
    }

  fnKeyword = 'fn' { return { type: 'fnKeyword', value: text(), children: [], location: nodeLocation() } }

  returnKeyword = 'return' { return { type: 'returnKeyword', value: 'return', children: [], location: nodeLocation() } }

  // expressions
  expression
    =  callExpression / propertyAccessExpression / binaryExpression

  callExpression
    = _ expr:propertyAccessExpression _ openParen _ args:fnArgs _ closeParen _ {
      return { type: 'callExpression', children: [expr, args], location: nodeLocation() }
    }
    / _ name:identifier _ openParen _ args:fnArgs _ closeParen _ {
      return { type: 'callExpression', children: [name, args], location: nodeLocation() }
    }

  propertyAccessExpression
    = _ object:identifier dot expr:propertyAccessExpression {
      return { type: 'propertyAccessExpression', children: [object, expr], location: nodeLocation() }
    }
    / _ object:identifier dot property:identifier _ {
      return { type: 'propertyAccessExpression', children: [object, property], location: nodeLocation() }
    }

  binaryExpression
    = _ left:identifier _ op:binaryOperator _ right:binaryExpression _ {
      return { type: 'binaryExpression', operator: op, children: [left, right], location: nodeLocation() }
    }
    / _ left:identifier _ op:binaryOperator _ right:identifier _ {
      return { type: 'binaryExpression', operator: op, children: [left, right], location: nodeLocation() }
    }

  binaryOperator
    = add { return '+' }
    / sub { return '-' }
    / multiply { return '*' }
    / div { return '/' }

  // variables

  variableDeclaration
    = _ type:variableType _ name:identifier _ equals _ varValue:variableValue _ {
      return {
        type: 'variable declaration',
        variableName: name.value,
        mutable: type.value === 'var',
        children: [varValue],
        location: nodeLocation()
      }
    }

  variableValue
    = expression
    / object
    / integer
    / boolean
    / string
    / identifier

  variableType
    = 'const' { return { type: 'variableType', value: text(), children: [], location: nodeLocation() } }
    / 'var' { return { type: 'variableType', value: text(), children: [], location: nodeLocation() } }

  identifier = [a-zA-Z0-9*]+ { return { type: 'identifier', value: text(), children: [], location: nodeLocation() } }

  // primitive data types

  integer = digits:[0-9]+ {
    return { type: 'integer', value: parseInt(digits.join(''), 10), children: [], location: nodeLocation() }
  }

  string = "'" inside:[^']* "'" {
    return { type: 'string', value: inside.join(''), children: [], location: nodeLocation() }
  }

  boolean
    = 'true' { return { type: 'boolean', value: true, children: [], location: nodeLocation() } }
    / 'false' { return { type: 'boolean', value: false, children: [], location: nodeLocation() } }

  // objects

  objectPropertyDeclaration
    = _ name:identifier _ ':' _ value:variableValue _ comma* _ {
      return { type: 'objectPropertyDeclaration', children: [name, value], location: nodeLocation() }
    }

  object
    = blockOpenParen _ prop:objectPropertyDeclaration* _ blockCloseParen {
      return { type: 'object', children: prop, location: nodeLocation() }
    }

  // common

  equals = '=' { return { type: 'equals', value: '=', children: [], location: nodeLocation() } }

  openParen = '(' { return { type: 'openParen', value: '(', children: [], location: nodeLocation() } }

  closeParen = ')' { return { type: 'closeParen', value: ')', children: [], location: nodeLocation() } }

  blockOpenParen = "{" { return { type: 'blockOpenParen', value: text(), children: [], location: nodeLocation() } }

  blockCloseParen = "}" { return { type: 'blockCloseParen', value: text(), children: [], location: nodeLocation() } }

  openSquareParen = '[' { return { type: 'openSquareParen', value: '[', children: [], location: nodeLocation() } }

  closeSquareParen = ']' { return { type: 'openSquareParen', value: ']', children: [], location: nodeLocation() } }

  add = '+' { return { type: 'add', value: '+', children: [], location: nodeLocation() } }

  sub = '-' { return { type: 'sub', value: '-', children: [], location: nodeLocation() } }

  multiply = '*' { return { type: 'multiply', value: '*', children: [], location: nodeLocation() } }

  div = '/' { return { type: 'div', value: '/', children: [], location: nodeLocation() } }

  comma = ',' { return { type: 'comma', value: ',', children: [], location: nodeLocation() } }

  dot = '.' { return { type: 'dot', value: '.', children: [], location: nodeLocation() } }

  _ = [ \t\n\r]*
