{
  const nodeLocation = () => {
    const loc = location()
    return { start: loc.start, end: loc.end }
  }

  const emptyLocation = () => {
    return { start: { offset: 0, column: 0, line: 0 }, end: { offset: 0, column: 0, line: 0 } }
  }
}

start
    = program

  program = statement+

  statement = expression / variableDeclaration / kibaComponentDeclaration

  // components

  kibaComponentDeclaration = _ 'component' _ name:identifier _ openParen _ closeParen _ fnArrow _ blockOpenParen _
    returnKeyword _ returnedElement:kibaElement _
  _ blockCloseParen _ {
    return { type: 'kibaComponentDeclaration', name, returnedElement }
  }

  elementStart = '<' name:identifier '>' {
    return { type: 'elementStart', value: name.value }
  }

  elementEnd = '</' name:identifier '>' {
    return { type: 'elementEnd', value: name.value }
  }

  kibaElement = nestedKibaElement

  kibaElementContent
   = kibaElement
   / identifier

  nestedKibaElement = _ start:elementStart _ content:kibaElementContent* _ end:elementEnd _ & { return start.value === end.value } {
    return { type: 'kibaElement', children: content, name: start.value }
  }

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

  namedFnExpression
    = _ letKeyword _ name:identifier _ equals _ openParen _ params:fnParams _ closeParen _ fnArrow _ expr:expression _ {
        return {
          type: 'namedFnExpression',
          children: [
            name,
            params,
            { type: 'returnExpression', children: [expr], location: nodeLocation() },
          ],
          location: nodeLocation(),
        }
    }
    / _ letKeyword _ name:identifier _ equals _ openParen _ params:fnParams _ closeParen _ fnArrow _ value:variableValue _ {
        return {
          type: 'namedFnExpression',
          children: [
            name,
            params,
            { type: 'returnExpression', children: [value], location: nodeLocation() },
          ],
          location: nodeLocation(),
        }
    }
    / _ letKeyword _ name:identifier _ equals _ openParen _ params:fnParams _ closeParen _ fnArrow _ blockOpenParen _
        body:statement*
        retExpr:returnExpression
      _ blockCloseParen _ {
       return { type: 'namedFnExpression', children: [name, params, ...body, retExpr], location: nodeLocation() }
    }

  anonymousFnExpression
    = _ openParen _ params:fnParams _ closeParen _ fnArrow _ expr:expression _ {
       return { type: 'anonymousFnExpression', children: [params, expr], location: nodeLocation() }
    }
    / _ openParen _ params:fnParams _ closeParen _ fnArrow _ value:variableValue _ {
       return { type: 'anonymousFnExpression', children: [params, value], location: nodeLocation() }
    }
    / _ openParen _ params:fnParams _ closeParen _ fnArrow _ blockOpenParen _
        body:statement*
        retExpr:returnExpression
      _ blockCloseParen _ {
       return { type: 'anonymousFnExpression', children: [params, ...body, retExpr], location: nodeLocation() }
    }

  fnKeyword = 'fn' { return { type: 'fnKeyword', value: text(), children: [], location: nodeLocation() } }

  returnKeyword = 'return' { return { type: 'returnKeyword', value: 'return', children: [], location: nodeLocation() } }

  fnArrow = '->' { return { type: 'fnArrow', value: text(), children: [], location: nodeLocation() } }

  // expressions
  expression
    = namedFnExpression / anonymousFnExpression / callExpression / propertyAccessExpression / binaryExpressions

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

  binaryExpressions
    = commonBinaryExpression

  commonBinaryExpression
    = _ openP:openParen _ left:identifier _ op:binaryOperator _ right:identifier _ closeP:closeParen _ {
      return { type: 'binaryExpression', children: [openP, left, op, right, closeP], location: nodeLocation() }
    }
    / _ left:identifier _ op:binaryOperator _ right:identifier _ {
      return { type: 'binaryExpression', children: [left, op, right], location: nodeLocation() }
    }

  binaryOperator
    = add { return { type: 'binaryOperator', value: '+', children: [], location: nodeLocation() } }
    / sub { return { type: 'binaryOperator', value: '-', children: [], location: nodeLocation() } }
    / multiply { return { type: 'binaryOperator', value: '*', children: [], location: nodeLocation() } }
    / div { return { type: 'binaryOperator', value: '/', children: [], location: nodeLocation() } }
    / equals { return { type: 'binaryOperator', value: '==', children: [], location: nodeLocation() } }

  // variables

  variableDeclaration
    = _ type:letKeyword _ name:identifier _ equals _ varValue:variableValue _ {
      return {
        type: 'variable declaration',
        variableName: name.value,
        children: [varValue],
        location: nodeLocation()
      }
    }

  variableValue
    = expression
    / object
    / array
    / void
    / integer
    / boolean
    / string
    / identifier

  letKeyword = 'let' { return { type: 'letKeyword', value: text(), children: [], location: nodeLocation() } }

  identifier = [a-zA-Z0-9*]+ { return { type: 'identifier', value: text(), children: [], location: nodeLocation() } }

  // primitive data types

  void = 'void' {
    return { type: 'void', value: 'void', children: [], location: nodeLocation() }
  }

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

  otherArrayItems
   = _ comma _ value:variableValue _ {
     return value
   }

  array
    = openSquareParen _ item:variableValue _ others:otherArrayItems* _ closeSquareParen {
      return { type: 'array', children: [item].concat(others), location: nodeLocation() }
    }
    / openSquareParen _ closeSquareParen {
      return { type: 'array', children: [], location: nodeLocation() }
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
