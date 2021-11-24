start
    = program

  program = statement+

  statement = fnDeclaration / variableDeclaration / expression

  // functions

  fnArgsEnumeration
    = _ comma _ value:variableValue _ { return value }

  fnArgs
    = value:variableValue others:fnArgsEnumeration* { return { type: 'fnArgs', children: [value, ...others] } }
    / _ value:variableValue* _ { return { type: 'fnArgs', children: value } }

  fnParamsEnumeration
    = _ comma _ param:identifier _ { return param }

  fnParams
    = params:identifier others:fnParamsEnumeration* { return { type: 'fnParams', children: [params, ...others] } }
    / params:identifier* { return { type: 'fnParams', children: params } }

  returnExpression
    = _ ret:returnKeyword _ expr:expression _ {
      return { type: 'returnExpression', children: [expr] }
    }
    / _ ret:returnKeyword _ expr:variableValue _ {
      return { type: 'returnExpression', children: [expr] }
    }

  fnDeclaration
    = _ fnKeyword _ name:identifier _ openParen _ params:fnParams _ closeParen _ blockOpenParen _
        body:statement*
        retExpr:returnExpression
      _ blockCloseParen _ {
      return { type: 'fnDeclaration', name: name.value, children: [params, ...body, retExpr]  }
    }

  fnKeyword = 'fn' { return { type: 'fnKeyword', value: text(), children: [] } }

  returnKeyword = 'return' { return { type: 'returnKeyword', value: 'return', children: [] } }

  // expressions
  expression
    =  callExpression / propertyAccessExpression / binaryExpression

  callExpression
    = _ expr:propertyAccessExpression _ openParen _ args:fnArgs _ closeParen _ {
      return { type: 'callExpression', children: [expr, args] }
    }
    / _ name:identifier _ openParen _ args:fnArgs _ closeParen _ {
      return { type: 'callExpression', children: [name, args] }
    }

  propertyAccessExpression
    // = _ object:identifier dot expr:callExpression {
    //  return { type: 'propertyAccessExpression', children: [object, expr] }
    // }
    = _ object:identifier dot expr:propertyAccessExpression {
      return { type: 'propertyAccessExpression', children: [object, expr] }
    }
    / _ object:identifier dot property:identifier _ {
      return { type: 'propertyAccessExpression', children: [object, property] }
    }

  binaryExpression
    = _ left:identifier _ op:binaryOperator _ right:binaryExpression _ {
      return { type: 'binaryExpression', operator: op, children: [left, right] }
    }
    / _ left:identifier _ op:binaryOperator _ right:identifier _ {
      return { type: 'binaryExpression', operator: op, children: [left, right] }
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
        type: 'variable declaration', variableType: type.value, variableName: name.value, mutable: type.value === 'var', children: [varValue]
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
    = 'const' { return { type: 'variableType', value: text(), children: [] } }
    / 'var' { return { type: 'variableType', value: text(), children: [] } }

  identifier = [a-zA-Z0-9*]+ { return { type: 'identifier', value: text(), children: [] } }

  // primitive data types

  integer = digits:[0-9]+ {
    return { type: 'integer', value: parseInt(digits.join(''), 10), children: [] }
  }

  string = "'" inside:[^']* "'" {
    return { type: 'string', value: inside.join(''), children: [] }
  }

  boolean
    = 'true' { return { type: 'boolean', value: true, children: [] } }
    / 'false' { return { type: 'boolean', value: false, children: [] } }

  // objects

  objectPropertyDeclaration
    = _ name:identifier _ ':' _ value:variableValue _ comma* _ {
      return { type: 'objectPropertyDeclaration', children: [name, value] }
    }

  object
    = blockOpenParen _ prop:objectPropertyDeclaration* _ blockCloseParen {
      return { type: 'object', children: prop }
    }

  // common

  equals = '=' { return { type: 'equals', value: '=', children: [] } }

  openParen = '(' { return { type: 'openParen', value: '(', children: [] } }

  closeParen = ')' { return { type: 'closeParen', value: ')', children: [] } }

  blockOpenParen = "{" { return { type: 'blockOpenParen', value: text(), children: [] } }

  blockCloseParen = "}" { return { type: 'blockCloseParen', value: text(), children: [] } }

  openSquareParen = '[' { return { type: 'openSquareParen', value: '[', children: [] } }

  closeSquareParen = ']' { return { type: 'openSquareParen', value: ']', children: [] } }

  add = '+' { return { type: 'add', value: '+', children: [] } }

  sub = '-' { return { type: 'sub', value: '-', children: [] } }

  multiply = '*' { return { type: 'multiply', value: '*', children: [] } }

  div = '/' { return { type: 'div', value: '/', children: [] } }

  comma = ',' { return { type: 'comma', value: ',', children: [] } }

  dot = '.' { return { type: 'dot', value: '.', children: [] } }

  _ = [ \t\n\r]*
