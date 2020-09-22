# Code Style

The documentation below is the standard code style for all official Grind projects. Of course, there’s no requirement to use it in your own projects, but when contributing code to the Grind packages, please adhere to this standard.

You can find eslint settings for Grind at [github.com/grindjs/eslint-config-grind](https://github.com/grindjs/eslint-config-grind).

The style guide has been ported and modified from the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) to reflect Grind’s style.

[[toc]]

## References

#### Use `const` for all of your references; avoid using `var`.

> {tip} Why? This ensures that you can’t reassign your references, which can lead to bugs and difficult to comprehend code.

```js
// bad
var a = 1
var b = 2

// good
const a = 1
const b = 2
```

#### If you must reassign references, use `let` instead of `var`.

> {tip} Why? `let` is block-scoped rather than function-scoped like `var`.

```js
// bad
var count = 1
if (true) {
  count += 1
}

// good, use the let.
let count = 1
if (true) {
  count += 1
}
```

#### Note that both `let` and `const` are block-scoped.

```js
// const and let only exist in the blocks they are defined in.
{
  let a = 1
  const b = 1
}
console.log(a) // ReferenceError
console.log(b) // ReferenceError
```

## Objects

#### Use the literal syntax for object creation.

```js
// bad
const item = new Object()

// good
const item = {}
```

#### Use computed property names when creating objects with dynamic property names.

> {tip} Why? They allow you to define all the properties of an object in one place.

```js
function getKey(k) {
  return `a key named ${k}`
}

// bad
const obj = {
  id: 5,
  name: 'San Francisco',
}
obj[getKey('enabled')] = true

// good
const obj = {
  id: 5,
  name: 'San Francisco',
  [getKey('enabled')]: true,
}
```

#### Use object method shorthand.

```js
// bad
const atom = {
  value: 1,

  addValue: function (value) {
    return atom.value + value
  },
}

// good
const atom = {
  value: 1,

  addValue(value) {
    return atom.value + value
  },
}
```

#### Use property value shorthand.

> {tip} Why? It is shorter to write and descriptive.

```js
const lukeSkywalker = 'Luke Skywalker'

// bad
const obj = {
  lukeSkywalker: lukeSkywalker,
}

// good
const obj = { lukeSkywalker }
```

#### Group your shorthand properties at the beginning of your object declaration.

> {tip} Why? It’s easier to tell which properties are using the shorthand.

```js
const anakinSkywalker = 'Anakin Skywalker'
const lukeSkywalker = 'Luke Skywalker'

// bad
const obj = {
  episodeOne: 1,
  twoJediWalkIntoACantina: 2,
  lukeSkywalker,
  episodeThree: 3,
  mayTheFourth: 4,
  anakinSkywalker,
}

// good
const obj = {
  lukeSkywalker,
  anakinSkywalker,
  episodeOne: 1,
  twoJediWalkIntoACantina: 2,
  episodeThree: 3,
  mayTheFourth: 4,
}
```

#### Only quote properties that are invalid identifiers.

> {tip} Why? In general we consider it subjectively easier to read. It improves syntax highlighting, and is also more easily optimized by many JS engines.

```js
// bad
const bad = {
  'foo': 3,
  'bar': 4,
  'data-blah': 5,
}

// good
const good = {
  'foo': 3,
  'bar': 4,
  'data-blah': 5,
}
```

#### Do not call `Object.prototype` methods directly, such as `hasOwnProperty`, `propertyIsEnumerable`, and `isPrototypeOf`.

> {tip} Why? These methods may be shadowed by properties on the object in question - consider `{ hasOwnProperty: false }` - or, the object may be a null object (`Object.create(null)`).

```js
// bad
console.log(object.hasOwnProperty(key))

// good
console.log(Object.prototype.hasOwnProperty.call(object, key))

// best
const has = Object.prototype.hasOwnProperty // cache the lookup once, in module scope.
console.log(has.call(object, key))
```

#### Prefer the object spread operator over [`Object.assign`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) to shallow-copy objects. Use the object rest operator to get a new object with certain properties omitted.

```js
// very bad
const original = { a: 1, b: 2 }
const copy = Object.assign(original, { c: 3 }) // this mutates `original` ಠ_ಠ
delete copy.a // so does this

// bad
const original = { a: 1, b: 2 }
const copy = Object.assign({}, original, { c: 3 }) // copy => { a: 1, b: 2, c: 3 }

// good
const original = { a: 1, b: 2 }
const copy = { ...original, c: 3 } // copy => { a: 1, b: 2, c: 3 }
const { a, ...noA } = copy // noA => { b: 2, c: 3 }
```

## Arrays

#### Use the literal syntax for array creation.

```js
// bad
const items = new Array()

// good
const items = []
```

#### Use [Array#push](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/push) instead of direct assignment to add items to an array.

```js
const someStack = []

// bad
someStack[someStack.length] = 'abracadabra'

// good
someStack.push('abracadabra')
```

#### Use array spreads `...` to copy arrays.

```js
// very bad
const len = items.length
const itemsCopy = []
let i

for (i = 0; i < len; i += 1) {
  itemsCopy[i] = items[i]
}

// bad
const itemsCopy = items.slice()

// good
const itemsCopy = [...items]
```

#### To convert an array-like object to an array, use spreads `...` instead of [Array.from](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

```js
const foo = document.querySelectorAll('.foo')

// good
const nodes = Array.from(foo)

// best
const nodes = [...foo]
```

#### Use `Array.from` instead of spread `...` for mapping over iterables, because it avoids creating an intermediate array.

```js
// bad
const baz = [...foo].map(bar)

// good
const baz = Array.from(foo, bar)
```

#### Use return statements in array method callbacks. You should omit the return if the function body consists of a single statement returning an expression without side effects.

```js
// good
;[1, 2, 3]
  .map(x => {
    const y = x + 1
    return x * y
  })

  [
    // good
    (1, 2, 3)
  ].map(x => x + 1)

// bad - no returned value means `memo` becomes undefined after the first iteration
const flat = {}[([0, 1], [2, 3], [4, 5])].reduce((memo, item, index) => {
  const flatten = memo.concat(item)
  memo[index] = flatten
})

// good
const flat = {}[([0, 1], [2, 3], [4, 5])].reduce((memo, item, index) => {
  const flatten = memo.concat(item)
  memo[index] = flatten
  return flatten
})

// bad
inbox.filter(msg => {
  const { subject, author } = msg

  if (subject === 'Mockingbird') {
    return author === 'Harper Lee'
  } else {
    return false
  }
})

// good
inbox.filter(msg => {
  const { subject, author } = msg

  if (subject === 'Mockingbird') {
    return author === 'Harper Lee'
  }

  return false
})
```

#### Use line breaks after open and before close array brackets if an array has multiple lines

```js
// bad
const arr = [
  [0, 1],
  [2, 3],
  [4, 5],
]

const objectInArray = [
  {
    id: 1,
  },
  {
    id: 2,
  },
]

const numberInArray = [1, 2]

// good
const arr = [
  [0, 1],
  [2, 3],
  [4, 5],
]

const objectInArray = [
  {
    id: 1,
  },
  {
    id: 2,
  },
]

const numberInArray = [1, 2]

const numberInArray = [1, 2]
```

## Destructuring

#### Use object destructuring when accessing and using multiple properties of an object.

> {tip} Why? Destructuring saves you from creating temporary references for those properties.

```js
// bad
function getFullName(user) {
  const firstName = user.firstName
  const lastName = user.lastName

  return `${firstName} ${lastName}`
}

// good
function getFullName(user) {
  const { firstName, lastName } = user
  return `${firstName} ${lastName}`
}

// best
function getFullName({ firstName, lastName }) {
  return `${firstName} ${lastName}`
}
```

#### Use array destructuring.

```js
const arr = [1, 2, 3, 4]

// bad
const first = arr[0]
const second = arr[1]

// good
const [first, second] = arr
```

#### Use object destructuring for multiple return values, not array destructuring.

> {tip} Why? You can add new properties over time or change the order of things without breaking call sites.

```js
// bad
function processInput(input) {
  // then a miracle occurs
  return [left, right, top, bottom]
}

// the caller needs to think about the order of return data
const [left, __, top] = processInput(input)

// good
function processInput(input) {
  // then a miracle occurs
  return { left, right, top, bottom }
}

// the caller selects only the data they need
const { left, top } = processInput(input)
```

## Strings

#### Use single quotes `''` for strings.

```js
// bad
const name = 'Capt. Janeway'

// bad - template literals should contain interpolation or newlines
const name = `Capt. Janeway`

// good
const name = 'Capt. Janeway'
```

#### Strings that cause the line to go over 120 characters should not be written across multiple lines using string concatenation.

> {tip} Why? Broken strings are painful to work with and make code less searchable.

```js
// bad
const errorMessage =
  'This is a super long error that was thrown because \
of Batman. When you stop to think about how Batman had anything to do \
with this, you would get nowhere \
fast.'

// bad
const errorMessage =
  'This is a super long error that was thrown because ' +
  'of Batman. When you stop to think about how Batman had anything to do ' +
  'with this, you would get nowhere fast.'

// good
const errorMessage =
  'This is a super long error that was thrown because of Batman. When you stop to think about how Batman had anything to do with this, you would get nowhere fast.'
```

#### When programmatically building up strings, use template strings instead of concatenation.

> {tip} Why? Template strings give you a readable, concise syntax with proper newlines and string interpolation features.

```js
// bad
function sayHi(name) {
  return 'How are you, ' + name + '?'
}

// bad
function sayHi(name) {
  return ['How are you, ', name, '?'].join()
}

// bad
function sayHi(name) {
  return `How are you, ${name}?`
}

// good
function sayHi(name) {
  return `How are you, ${name}?`
}
```

#### Never use `eval()` on a string, it opens too many vulnerabilities.

#### Do not unnecessarily escape characters in strings.

> {tip} Why? Backslashes harm readability, thus they should only be present when necessary.

```js
// bad
const foo = '\'this\' is "quoted"'

// good
const foo = '\'this\' is "quoted"'
const foo = `my name is '${name}'`
```

## Functions

#### Wrap immediately invoked function expressions in parentheses.

> {tip} Why? An immediately invoked function expression is a single unit - wrapping both it, and its invocation parens, in parens, cleanly expresses this. Note that in a world with modules everywhere, you almost never need an IIFE.

```js
// immediately-invoked function expression (IIFE)
;(function () {
  console.log('Welcome to the Internet. Please follow me.')
})()
```

#### Never declare a function in a non-function block (`if`, `while`, etc). Assign the function to a variable instead. Browsers will allow you to do it, but they all interpret it differently, which is bad news bears.

> {note} ECMA-262 defines a `block` as a list of statements. A function declaration is not a statement. [Read ECMA-262’s note on this issue](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf#page=97).

```js
// bad
if (currentUser) {
  function test() {
    console.log('Nope.')
  }
}

// good
let test
if (currentUser) {
  test = () => console.log('Yup.')
}
```

#### Never name a parameter `arguments`. This will take precedence over the `arguments` object that is given to every function scope.

```js
// bad
function foo(name, options, arguments) {
  // ...
}

// good
function foo(name, options, args) {
  // ...
}
```

#### Never use `arguments`, opt to use rest syntax `...` instead.

> {tip} Why? `...` is explicit about which arguments you want pulled. Plus, rest arguments are a real Array, and not merely Array-like like `arguments`.

```js
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments)
  return args.join('')
}

// good
function concatenateAll(...args) {
  return args.join('')
}
```

#### Use default parameter syntax rather than mutating function arguments.

```js
// really bad
function handleThings(opts) {
  // No! We shouldn’t mutate function arguments.
  // Double bad: if opts is falsy it'll be set to an object which may
  // be what you want but it can introduce subtle bugs.
  opts = opts || {}
  // ...
}

// still bad
function handleThings(opts) {
  if (opts === void 0) {
    opts = {}
  }
  // ...
}

// good
function handleThings(opts = {}) {
  // ...
}
```

#### Avoid side effects with default parameters.

> {tip} Why? They are confusing to reason about.

```js
var b = 1

// bad
function count(a = b++) {
  console.log(a)
}
count() // 1
count() // 2
count(3) // 3
count() // 3
```

#### Always put default parameters last.

```js
// bad
function handleThings(opts = {}, name) {
  // ...
}

// good
function handleThings(name, opts = {}) {
  // ...
}
```

#### Never use the Function constructor to create a new function.

> {tip} Why? Creating a function in this way evaluates a string similarly to eval(), which opens vulnerabilities.

```js
// bad
const add = new Function('a', 'b', 'return a + b')

// still bad
const subtract = Function('a', 'b', 'return a - b')
```

#### Spacing in a function signature.

```js
// bad
const f = function () {}
const g = function () {}
const h = function () {}

// good
const x = function () {}
const y = function a() {}
```

#### Never mutate parameters.

> {tip} Why? Manipulating objects passed in as parameters can cause unwanted variable side effects in the original caller.

```js
// bad
function f1(obj) {
  obj.key = 1
}

// good
function f2(obj) {
  const key = Object.prototype.hasOwnProperty.call(obj, 'key') ? obj.key : 1
}
```

#### Prefer the use of the spread operator `...` to call variadic functions.

> {tip} Why? It’s cleaner, you don’t need to supply a context, and you can not easily compose `new` with `apply`.

```js
// bad
const x = [1, 2, 3, 4, 5]
console.log.apply(console, x)

// good
const x = [1, 2, 3, 4, 5]
console.log(...x)

// bad
new (Function.prototype.bind.apply(Date, [null, 2016, 8, 5]))()

// good
new Date(...[2016, 8, 5])
```

#### Functions with multiline signatures, or invocations, should be indented just like every other multiline list in this guide: with each item on a line by itself.

```js
// bad
function foo(bar, baz, quux) {
  // ...
}

// good
function foo(bar, baz, quux) {
  // ...
}

// bad
console.log(foo, bar, baz)

// good
console.log(foo, bar, baz)
```

## Arrow Functions

#### When you must use function expressions (as when passing an anonymous function), use arrow function notation.

> {tip} Why? It creates a version of the function that executes in the context of `this`, which is usually what you want, and is a more concise syntax.

> {tip} Why not? If you have a fairly complicated function, you might move that logic out into its own function declaration.

```js
// bad
;[1, 2, 3]
  .map(function (x) {
    const y = x + 1
    return x * y
  })

  [
    // good
    (1, 2, 3)
  ].map(x => {
    const y = x + 1
    return x * y
  })
```

#### If the function body consists of a single statement returning an [expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#Expressions) without side effects, omit the braces and use the implicit return. Otherwise, keep the braces and use a `return` statement.

> {tip} Why? Syntactic sugar. It reads well when multiple functions are chained together.

```js
// bad
;[1, 2, 3]
  .map(number => {
    const nextNumber = number + 1`A string containing the ${nextNumber}.`
  })

  [
    // good
    (1, 2, 3)
  ].map(number => `A string containing the ${number}.`)

  [
    // good
    (1, 2, 3)
  ].map(number => {
    const nextNumber = number + 1
    return `A string containing the ${nextNumber}.`
  })

  [
    // good
    (1, 2, 3)
  ].map((number, index) => ({
    [index]: number,
  }))

// No implicit return with side effects
function foo(callback) {
  const val = callback()
  if (val === true) {
    // Do something if callback returns true
  }
}

let bool = false

// bad
foo(() => (bool = true))

// good
foo(() => {
  bool = true
})
```

#### In case the expression spans over multiple lines, wrap it in parentheses for better readability.

> {tip} Why? It shows clearly where the function starts and ends.

```js
// bad
;['get', 'post', 'put']
  .map(httpMethod =>
    Object.prototype.hasOwnProperty.call(httpMagicObjectWithAVeryLongName, httpMethod),
  )

  [
    // good
    ('get', 'post', 'put')
  ].map(httpMethod =>
    Object.prototype.hasOwnProperty.call(httpMagicObjectWithAVeryLongName, httpMethod),
  )
```

#### If your function takes a single argument, omit the parentheses. Otherwise, always include parentheses around arguments for clarity and consistency.

> {tip} Why? Less visual clutter.

```js
// bad
;[1, 2, 3]
  .map(x => x * x)

  [
    // good
    (1, 2, 3)
  ].map(x => x * x)

  [
    // good
    (1, 2, 3)
  ].map(
    number =>
      `A long string with the ${number}. It’s so long that we don’t want it to take up space on the .map line!`,
  )

  [
    // bad
    (1, 2, 3)
  ].map(x => {
    const y = x + 1
    return x * y
  })

  [
    // good
    (1, 2, 3)
  ].map(x => {
    const y = x + 1
    return x * y
  })
```

## Classes & Constructors

#### Always use `class`. Avoid manipulating `prototype` directly.

> {tip} Why? `class` syntax is more concise and easier to reason about.

```js
// bad
function Queue(contents = []) {
  this.queue = [...contents]
}

Queue.prototype.pop = function () {
  const value = this.queue[0]
  this.queue.splice(0, 1)
  return value
}

// good
class Queue {
  constructor(contents = []) {
    this.queue = [...contents]
  }

  pop() {
    const value = this.queue[0]
    this.queue.splice(0, 1)
    return value
  }
}
```

#### Use `extends` for inheritance.

> {tip} Why? It is a built-in way to inherit prototype functionality without breaking `instanceof`.

```js
// bad
const inherits = require('inherits')

function PeekableQueue(contents) {
  Queue.apply(this, contents)
}

inherits(PeekableQueue, Queue)

PeekableQueue.prototype.peek = function () {
  return this.queue[0]
}

// good
class PeekableQueue extends Queue {
  peek() {
    return this.queue[0]
  }
}
```

#### Methods can return `this` to help with method chaining.

```js
// bad
Jedi.prototype.jump = function () {
  this.jumping = true
  return true
}

Jedi.prototype.setHeight = function (height) {
  this.height = height
}

const luke = new Jedi()
luke.jump() // => true
luke.setHeight(20) // => undefined

// good
class Jedi {
  jump() {
    this.jumping = true
    return this
  }

  setHeight(height) {
    this.height = height
    return this
  }
}

const luke = new Jedi()

luke.jump().setHeight(20)
```

#### It’s okay to write a custom toString() method, just make sure it works successfully and causes no side effects.

```js
class Jedi {
  constructor({ name = 'no name' } = {}) {
    this.name = name
  }

  getName() {
    return this.name
  }

  toString() {
    return `Jedi - ${this.getName()}`
  }
}
```

#### Classes have a default constructor if one is not specified. An empty constructor function or one that just delegates to a parent class is unnecessary.

```js
// bad
class Jedi {
  constructor() {}

  getName() {
    return this.name
  }
}

// bad
class Rey extends Jedi {
  constructor(...args) {
    super(...args)
  }
}

// good
class Rey extends Jedi {
  constructor(...args) {
    super(...args)

    this.name = 'Rey'
  }
}
```

#### When creating a class with no arguments, do not include parentheses

```js
// bad
const luke = new Jedi()

// good
const luke = new Jedi()
```

#### Avoid duplicate class members.

> {tip} Why? Duplicate class member declarations will silently prefer the last one - having duplicates is almost certainly a bug.

```js
// bad
class Foo {
  bar() {
    return 1
  }
  bar() {
    return 2
  }
}

// good
class Foo {
  bar() {
    return 1
  }
}
```

## Modules

#### Always use modules (`import`/`export`) over a non-standard module system. You can always transpile to your preferred module system.

> {tip} Why? Modules are the future, let’s start using the future now.

```js
// bad
const GrindCodeStyle = require('./GrindCodeStyle')
module.exports = GrindCodeStyle.es6

// still bad
const { es6 } = require('./GrindCodeStyle')
export { es6 }

// good
import { es6 } from './GrindCodeStyle'
export { es6 }
```

#### Do not use wildcard imports.

```js
// bad
import * as GrindCodeStyle from './GrindCodeStyle'

// good
import GrindCodeStyle from './GrindCodeStyle'
```

#### Do not export directly from an import.

> {tip} Why? Although the one-liner is concise, having one clear way to import and one clear way to export makes things consistent.

```js
// bad
// filename es6.js
export { es6 as default } from './GrindCodeStyle'

// good
// filename es6.js
import { es6 } from './GrindCodeStyle'
export { es6 }
```

#### Only import from a path in one place.

> {tip} Why? Having multiple lines that import from the same path can make code harder to maintain.

```js
// bad
import foo from 'foo'

// … some other imports … //
import { named1, named2 } from 'foo'

// good
import foo, { named1, named2 } from 'foo'

// good
import foo, { named1, named2 } from 'foo'
```

#### Do not export mutable bindings.

> {tip} Why? Mutation should be avoided in general, but in particular when exporting mutable bindings. While this technique may be needed for some special cases, in general, only constant references should be exported.

```js
// bad
let foo = 3
export { foo }

// good
const foo = 3
export { foo }

// best
export const foo = 3
```

#### In modules with a single export, prefer named export over default export.

```js
// bad
export default function foo() {}

// good
export function foo() {}
```

#### Put all `import`s above non-import statements.

> {tip} Why? Since `import`s are hoisted, keeping them all at the top prevents surprising behavior.

```js
// bad
import foo from 'foo'
foo.init()

import bar from 'bar'

// good
import foo from 'foo'
import bar from 'bar'

foo.init()
```

#### Multiline imports should be indented just like multiline array and object literals.

> {tip} Why? The curly braces follow the same indentation rules as every other curly brace block in the style guide.

```js
// bad
import { longNameA, longNameB, longNameC, longNameD, longNameE } from 'module'

// good
import { longNameA, longNameB, longNameC, longNameD, longNameE } from 'module'
```

## Iterators and Loops

#### Use iterators/loops like `for-of`. Dont’t use `forEach`

> {tip} Use `map()` / `every()` / `filter()` / `find()` / `findIndex()` / `reduce()` / `some()` / ... to iterate over arrays, and `Object.keys()` / `Object.values()` / `Object.entries()` to produce arrays so you can iterate over objects.

```js
const numbers = [1, 2, 3, 4, 5]

// bad
let sum = 0
numbers.forEach(num => {
  sum += num
})
sum === 15

// good
let sum = 0
for (const num of numbers) {
  sum += num
}
sum === 15

// best (use the functional force)
const sum = numbers.reduce((total, num) => total + num, 0)
sum === 15

// bad
const increasedByOne = []
for (let i = 0; i < numbers.length; i++) {
  increasedByOne.push(numbers[i] + 1)
}

// bad
const increasedByOne = []
numbers.forEach(num => {
  increasedByOne.push(num + 1)
})

// good
const increasedByOne = []
for (const num of numbers) {
  increasedByOne.push(num + 1)
}

// best (keeping it functional)
const increasedByOne = numbers.map(num => num + 1)
```

## Properties

#### Use dot notation when accessing properties.

```js
const luke = {
  jedi: true,
  age: 28,
}

// bad
const isJedi = luke['jedi']

// good
const isJedi = luke.jedi
```

#### Use bracket notation `[]` when accessing properties with a variable.

```js
const luke = {
  jedi: true,
  age: 28,
}

function getProp(prop) {
  return luke[prop]
}

const isJedi = getProp('jedi')
```

#### Use exponentiation operator `**` when calculating exponentiations.

```js
// bad
const binary = Math.pow(2, 10)

// good
const binary = 2 ** 10
```

## Variables

#### Always use `const` or `let` to declare variables. Not doing so will result in global variables. We want to avoid polluting the global namespace. Captain Planet warned us of that.

```js
// bad
superPower = new SuperPower()

// good
const superPower = new SuperPower()
```

#### Use one `const` or `let` declaration per variable.

> {tip} Why? It’s easier to add new variable declarations this way, and you never have to worry about swapping out a `;` for a `,` or introducing punctuation-only diffs. You can also step through each declaration with the debugger, instead of jumping through all of them at once.

```js
// bad
const items = getItems(),
  goSportsTeam = true,
  dragonball = 'z'

// bad
// (compare to above, and try to spot the mistake)
const items = getItems(),
  goSportsTeam = true
dragonball = 'z'

// good
const items = getItems()
const goSportsTeam = true
const dragonball = 'z'
```

#### Group all your `const`s and then group all your `let`s.

> {tip} Why? This is helpful when later on you might need to assign a variable depending on one of the previous assigned variables.

```js
// bad
let i,
  len,
  dragonball,
  items = getItems(),
  goSportsTeam = true

// bad
let i
const items = getItems()
let dragonball
const goSportsTeam = true
let len

// good
const goSportsTeam = true
const items = getItems()
let dragonball
let i
let length
```

#### Assign variables where you need them, but place them in a reasonable place.

> {tip} Why? `let` and `const` are block scoped and not function scoped.

```js
// bad - unnecessary function call
function checkName(hasName) {
  const name = getName()

  if (hasName === 'test') {
    return false
  }

  if (name === 'test') {
    this.setName('')
    return false
  }

  return name
}

// good
function checkName(hasName) {
  if (hasName === 'test') {
    return false
  }

  const name = getName()

  if (name === 'test') {
    this.setName('')
    return false
  }

  return name
}
```

#### Don’t chain variable assignments.

> {tip} Why? Chaining variable assignments creates implicit global variables.

```js
// bad
;(function example() {
  // JavaScript interprets this as
  // let a = ( b = ( c = 1 ) )
  // The let keyword only applies to variable a; variables b and c become
  // global variables.
  let a = (b = c = 1)
})()

console.log(a) // throws ReferenceError
console.log(b) // 1
console.log(c)(
  // 1

  // good
  (function example() {
    let a = 1
    let b = a
    let c = a
  })(),
)

console.log(a) // throws ReferenceError
console.log(b) // throws ReferenceError
console.log(c) // throws ReferenceError

// the same applies for `const`
```

## Hoisting

#### `var` declarations get hoisted to the top of their scope, their assignment does not. `const` and `let` declarations are blessed with a new concept called [Temporal Dead Zones (TDZ)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let). It’s important to know why [typeof is no longer safe](http://es-discourse.com/t/why-typeof-is-no-longer-safe/15).

```js
// we know this wouldn’t work (assuming there
// is no notDefined global variable)
function example() {
  console.log(notDefined) // => throws a ReferenceError
}

// creating a variable declaration after you
// reference the variable will work due to
// variable hoisting. Note: the assignment
// value of `true` is not hoisted.
function example() {
  console.log(declaredButNotAssigned) // => undefined
  var declaredButNotAssigned = true
}

// the interpreter is hoisting the variable
// declaration to the top of the scope,
// which means our example could be rewritten as:
function example() {
  let declaredButNotAssigned
  console.log(declaredButNotAssigned) // => undefined
  declaredButNotAssigned = true
}

// using const and let
function example() {
  console.log(declaredButNotAssigned) // => throws a ReferenceError
  console.log(typeof declaredButNotAssigned) // => throws a ReferenceError
  const declaredButNotAssigned = true
}
```

#### Anonymous function expressions hoist their variable name, but not the function assignment.

```js
function example() {
  console.log(anonymous) // => undefined

  anonymous() // => TypeError anonymous is not a function

  var anonymous = function () {
    console.log('anonymous function expression')
  }
}
```

#### Named function expressions hoist the variable name, not the function name or the function body.

```js
function example() {
  console.log(named) // => undefined

  named() // => TypeError named is not a function

  superPower() // => ReferenceError superPower is not defined

  var named = function superPower() {
    console.log('Flying')
  }
}

// the same is true when the function name
// is the same as the variable name.
function example() {
  console.log(named) // => undefined

  named() // => TypeError named is not a function

  var named = function named() {
    console.log('named')
  }
}
```

#### Function declarations hoist their name and the function body.

```js
function example() {
  superPower() // => Flying

  function superPower() {
    console.log('Flying')
  }
}
```

#### For more information refer to [JavaScript Scoping & Hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting/) by [Ben Cherry](http://www.adequatelygood.com/).

## Comparison Operators & Equality

#### Use `===` and `!==` over `==` and `!=`.

Conditional statements such as the `if` statement evaluate their expression using coercion with the `ToBoolean` abstract method and always follow these simple rules:

- **Objects** evaluate to **true**
- **Undefined** evaluates to **false**
- **Null** evaluates to **false**
- **Booleans** evaluate to **the value of the boolean**
- **Numbers** evaluate to **false** if **+0, -0, or NaN**, otherwise **true**
- **Strings** evaluate to **false** if an empty string `''`, otherwise **true**

```js
if ([0] && []) {
  // true
  // an array (even an empty one) is an object, objects will evaluate to true
}
```

#### Use shortcuts for booleans, but explicit comparisons for strings and numbers.

```js
// bad
if (isValid === true) {
  // ...
}

// good
if (isValid) {
  // ...
}

// bad
if (name) {
  // ...
}

// good
if (name !== '') {
  // ...
}

// bad
if (collection.length) {
  // ...
}

// good
if (collection.length > 0) {
  // ...
}
```

> {tip} For more information see [Truth Equality and JavaScript](https://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/#more-2108) by Angus Croll.

#### Use braces to create blocks in `case` and `default` clauses that contain lexical declarations (e.g. `let`, `const`, `function`, and `class`).

> {tip} Why? Lexical declarations are visible in the entire `switch` block but only get initialized when assigned, which only happens when its `case` is reached. This causes problems when multiple `case` clauses attempt to define the same thing.

```js
// bad
switch (foo) {
  case 1:
    let x = 1
    break
  case 2:
    const y = 2
    break
  case 3:
    function f() {
      // ...
    }
    break
  default:
    class C {}
}

// good
switch (foo) {
  case 1: {
    let x = 1
    break
  }
  case 2: {
    const y = 2
    break
  }
  case 3: {
    function f() {
      // ...
    }
    break
  }
  case 4:
    bar()
    break
  default: {
    class C {}
  }
}
```

#### Avoid unneeded ternary statements.

```js
// bad
const foo = a ? a : b
const bar = c ? true : false
const baz = c ? false : true

// good
const foo = a || b
const bar = !!c
const baz = !c
```

## Blocks

#### Use braces with all blocks.

```js
// bad
if (test) return false

// bad
if (test) return false

// still bad
if (test) {
  return false
}

// good
if (test) {
  return false
}

// bad
function foo() {
  return false
}

// good
function bar() {
  return false
}
```

#### If you're using multi-line blocks with `if` and `else`, put `else` on the same line as your `if` block’s closing brace.

```js
// bad
if (test) {
  thing1()
  thing2()
} else {
  thing3()
}

// good
if (test) {
  thing1()
  thing2()
} else {
  thing3()
}
```

## Control Statements

#### In case your control statement (`if`, `while` etc.) gets too long or exceeds the maximum line length, each (grouped) condition could be put into a new line. It’s up to you whether the logical operator should begin or end the line.

```js
// bad
if (
  (foo === 123 || bar === 'abc') &&
  doesItLookGoodWhenItBecomesThatLong() &&
  isThisReallyHappening()
) {
  thing1()
}

// bad
if (foo === 123 && bar === 'abc') {
  thing1()
}

// bad
if (foo === 123 && bar === 'abc') {
  thing1()
}

// good
if (
  (foo === 123 || bar === 'abc') &&
  doesItLookGoodWhenItBecomesThatLong() &&
  isThisReallyHappening()
) {
  thing1()
}

// good
if (foo === 123 && bar === 'abc') {
  thing1()
}

// good
if (foo === 123 && bar === 'abc') {
  thing1()
}

// good
if (foo === 123 && bar === 'abc') {
  thing1()
}
```

## Comments

#### Use `/** ... */` for multi-line comments.

```js
// bad
// make() returns a new element
// based on the passed in tag name
//
// @param {String} tag
// @return {Element} element
function make(tag) {
  // ...
  return element
}

// good
/**
 * make() returns a new element
 * based on the passed-in tag name
 */
function make(tag) {
  // ...
  return element
}
```

#### Use `//` for single line comments. Place single line comments on a newline above the subject of the comment. Put an empty line before the comment unless it’s on the first line of a block.

```js
// bad
const active = true // is current tab

// good
// is current tab
const active = true

// bad
function getType() {
  console.log('fetching type...')
  // set the default type to 'no type'
  const type = this.type || 'no type'

  return type
}

// good
function getType() {
  console.log('fetching type...')

  // set the default type to 'no type'
  const type = this.type || 'no type'

  return type
}

// also good
function getType() {
  // set the default type to 'no type'
  const type = this.type || 'no type'

  return type
}
```

#### Start all comments with a space to make it easier to read.

```js
// bad
//is current tab
const active = true

// good
// is current tab
const active = true

// bad
/**
 *make() returns a new element
 *based on the passed-in tag name
 */
function make(tag) {
  // ...
  return element
}

// good
/**
 * make() returns a new element
 * based on the passed-in tag name
 */
function make(tag) {
  // ...
  return element
}
```

#### Prefixing your comments with `FIXME` or `TODO` helps other developers quickly understand if you’re pointing out a problem that needs to be revisited, or if you're suggesting a solution to the problem that needs to be implemented. These are different than regular comments because they are actionable. The actions are `FIXME: -- need to figure this out` or `TODO: -- need to implement`.

Use `// FIXME:` to annotate problems.

```js
class Calculator extends Abacus {
  constructor() {
    super()

    // FIXME: shouldn’t use a global here
    total = 0
  }
}
```

Use `// TODO:` to annotate solutions to problems.

```js
class Calculator extends Abacus {
  constructor() {
    super()

    // TODO: total should be configurable by an options param
    this.total = 0
  }
}
```

## Whitespace

#### Use hard tabs (tab character).

```js
// bad
function foo() {
∙∙∙∙let name
}

// bad
function bar() {
∙let name
}

// good
function baz() {
⇥let name
}
```

#### Place 1 space before the leading brace.

```js
// bad
function test() {
  console.log('test')
}

// good
function test() {
  console.log('test')
}

// bad
dog.set('attr', {
  age: '1 year',
  breed: 'Bernese Mountain Dog',
})

// good
dog.set('attr', {
  age: '1 year',
  breed: 'Bernese Mountain Dog',
})
```

#### Place no space before the opening parenthesis in control statements (`if`, `while` etc.). Place no space between the argument list and the function name in function calls and declarations.

```js
// bad
if (isJedi) {
  fight()
}

// good
if (isJedi) {
  fight()
}

// bad
function fight() {
  console.log('Swooosh!')
}

// good
function fight() {
  console.log('Swooosh!')
}
```

#### Set off operators with spaces.

```js
// bad
const x = y + 5

// good
const x = y + 5
```

#### End files with a single newline character.

```js
// bad
import { es6 } from './GrindCodeStyle'
// ...
export { es6 }
```

```js
// bad
import { es6 } from './GrindCodeStyle'
// ...
export { es6 }↵
↵
```

```js
// good
import { es6 } from './AirbnbStyleGuide'
// ...
export default es6↵
```

#### Do not use indentation when making long method chains. Use a leading dot, which emphasizes that the line is a method call, not a new statement.

```js
// bad
$('#items').find('.selected').highlight().end().find('.open').updateCount()

// bad
$('#items').find('.selected').highlight().end().find('.open').updateCount()

// good
$('#items').find('.selected').highlight().end().find('.open').updateCount()

// bad
const leds = stage
  .selectAll('.led')
  .data(data)
  .enter()
  .append('svg:svg')
  .classed('led', true)
  .attr('width', (radius + margin) * 2)
  .append('svg:g')
  .attr('transform', `translate(${radius + margin},${radius + margin})`)
  .call(tron.led)

// good
const leds = stage
  .selectAll('.led')
  .data(data)
  .enter()
  .append('svg:svg')
  .classed('led', true)
  .attr('width', (radius + margin) * 2)
  .append('svg:g')
  .attr('transform', `translate(${radius + margin},${radius + margin})`)
  .call(tron.led)

// good
const leds = stage.selectAll('.led').data(data)
```

#### Leave a blank line after blocks and before the next statement.

```js
// bad
if (foo) {
  return bar
}
return baz

// good
if (foo) {
  return bar
}

return baz

// bad
const obj = {
  foo() {},
  bar() {},
}
return obj

// good
const obj = {
  foo() {},

  bar() {},
}

return obj

// bad
const arr = [function foo() {}, function bar() {}]
return arr

// good
const arr = [function foo() {}, function bar() {}]

return arr
```

- Only classes should be padded, do not pad functions or switch blocks with blank lines.

```js
// bad
function bar() {
  console.log(foo)
}

// good
function bar() {
  console.log(foo)
}

// bad
if (baz) {
  console.log(qux)
} else {
  console.log(foo)
}

// good
if (baz) {
  console.log(qux)
} else {
  console.log(foo)
}

// bad
class Foo {
  constructor(bar) {
    this.bar = bar
  }
}

// good
class Foo {
  constructor(bar) {
    this.bar = bar
  }
}
```

#### Do not add spaces inside parentheses.

```js
// bad
function bar(foo) {
  return foo
}

// good
function bar(foo) {
  return foo
}

// bad
if (foo) {
  console.log(foo)
}

// good
if (foo) {
  console.log(foo)
}
```

#### Always add spaces when creating an array.

```js
// bad
const foo = [1, 2, 3]
console.log(foo[0])

// good
const foo = [1, 2, 3]
console.log(foo[0])
```

#### Never use spaces in brackets when using bracket notation on arrays or objects.

```js
// bad
foo[0]

// good
foo[0]

// bad
foo['data-attr']

// good
foo['data-attr']
```

#### Use a single space between brackets when creating an empty array

```js
// bad
const foo = []

// bad
const foo = []

// good
const foo = []
```

#### Add spaces inside curly braces.

```js
// bad
const foo = { clark: 'kent' }

// good
const foo = { clark: 'kent' }
```

#### Use a single space between curly braces when creating an empty object

```js
// bad
const foo = {}

// good
const foo = {}
```

#### Avoid having lines of code that are longer than 120 characters (including whitespace). Note: long strings are exempt from this rule, and should not be broken up.

> {tip} Why? This ensures readability and maintainability.

```js
// bad
const foo =
  jsonData &&
  jsonData.foo &&
  jsonData.foo.bar &&
  jsonData.foo.bar.baz &&
  jsonData.foo.bar.baz.quux &&
  jsonData.foo.bar.baz.quux.xyzzy

// good
const foo =
  jsonData &&
  jsonData.foo &&
  jsonData.foo.bar &&
  jsonData.foo.bar.baz &&
  jsonData.foo.bar.baz.quux &&
  jsonData.foo.bar.baz.quux.xyzzy

// bad
fetch('https://airbnb.com/', { method: 'POST', body: { name: 'John' } })
  .then(() => console.log('Congratulations!'))
  .catch(err => console.log('You have failed this city.', err))

// good
fetch('https://airbnb.com/', {
  method: 'POST',
  body: { name: 'John' },
})
  .then(() => console.log('Congratulations!'))
  .catch(err => console.log('You have failed this city.', err))
```

## Commas

#### Leading commas: **Nope.**

```js
// bad
const story = [once, upon, aTime]

// good
const story = [once, upon, aTime]

// bad
const hero = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  birthYear: 1815,
  superPower: 'computers',
}

// good
const hero = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  birthYear: 1815,
  superPower: 'computers',
}
```

#### Trailing commas

It’s up to you whether you use a trailing comma, however you should be consistent.

#### Trailing commas

## Semicolons

#### **Nope.**

```js
// bad
;(function () {
  const name = 'Skywalker'
  return name
})()(
  // good
  (function () {
    const name = 'Skywalker'
    return name
  })(),
)
```

## Type Casting & Coercion

#### Perform type coercion at the beginning of the statement.

##### Strings

```js
// => this.reviewScore = 9

// bad
const totalScore = this.reviewScore + '' // invokes this.reviewScore.valueOf()

// bad
const totalScore = this.reviewScore.toString() // isn’t guaranteed to return a string

// good
const totalScore = String(this.reviewScore)
```

##### Numbers

Use `Number` for type casting and `parseInt` always with a radix for parsing strings.

```js
const inputValue = '4'

// bad
const val = new Number(inputValue)

// bad
const val = +inputValue

// bad
const val = inputValue >> 0

// bad
const val = parseInt(inputValue)

// good
const val = Number(inputValue)

// good
const val = Number.parseInt(inputValue, 10)
```

If for whatever reason you are doing something wild and `parseInt` is your bottleneck and need to use Bitshift for [performance reasons](https://jsperf.com/coercion-vs-casting/3), leave a comment explaining why and what you're doing.

```js
// good
/**
 * parseInt was the reason my code was slow.
 * Bitshifting the String to coerce it to a
 * Number made it a lot faster.
 */
const val = inputValue >> 0
```

> {note} Be careful when using bitshift operations. Numbers are represented as [64-bit values](https://es5.github.io/#x4.3.19), but bitshift operations always return a 32-bit integer ([source](https://es5.github.io/#x11.7)). Bitshift can lead to unexpected behavior for integer values larger than 32 bits. [Discussion](https://github.com/airbnb/javascript/issues/109). Largest signed 32-bit Int is 2,147,483,647:

```js
2147483647 >> 0 // => 2147483647
2147483648 >> 0 // => -2147483648
2147483649 >> 0 // => -2147483647
```

##### Booleans

```js
const age = 0

// bad
const hasAge = new Boolean(age)

// bad
const hasAge = Boolean(age)

// bad
const hasAge = !!age

// good
const hasAge = age > 0
```

## Naming Conventions

#### Avoid single letter names. Be descriptive with your naming.

```js
// bad
function q() {
  // ...
}

// good
function query() {
  // ...
}
```

#### Use camelCase when naming objects, functions, and instances.

```js
// bad
const OBJEcttsssss = {}
const this_is_my_object = {}
function c() {}

// good
const thisIsMyObject = {}
function thisIsMyFunction() {}
```

#### Use PascalCase only when naming constructors or classes.

```js
// bad
function user(options) {
  this.name = options.name
}

const bad = new user({
  name: 'nope',
})

// good
class User {
  constructor(options) {
    this.name = options.name
  }
}

const good = new User({
  name: 'yup',
})
```

#### Don’t save references to `this`. Use arrow functions or [Function#bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).

```js
// bad
function foo() {
  const self = this
  return function () {
    console.log(self)
  }
}

// bad
function foo() {
  const that = this
  return function () {
    console.log(that)
  }
}

// good
function foo() {
  return () => {
    console.log(this)
  }
}
```

#### A base filename should exactly match the name of its primary export.

```js
// file 1 contents
export class CheckBox {
  // ...
}
// file 2 contents
export function fortyTwo() {
  return 42
}

// file 3 contents
export function insideDirectory() {}

// in some other file
// bad
import { CheckBox } from './checkBox' // PascalCase import/export, camelCase filename
import { fortyTwo } from './FortyTwo' // PascalCase filename, camelCase import/export
import { insideDirectory } from './InsideDirectory' // PascalCase filename, camelCase import/export

// bad
import { CheckBox } from './check_box' // PascalCase import/export, snake_case filename
import { fortyTwo } from './forty_two' // snake_case filename, camelCase import/export
import { insideDirectory } from './inside_directory' // snake_case file, camelCase export
import { insideDirectory } from './insideDirectory/index' // requiring the index file explicitly

// good
import { CheckBox } from './CheckBox' // PascalCase export/import/filename
import { fortyTwo } from './fortyTwo' // camelCase export/import/filename
import { insideDirectory } from './insideDirectory' // camelCase export/import/directory name/implicit "index"
// ^ supports both insideDirectory.js and insideDirectory/index.js
```

#### Use camelCase when you export a function. Your filename should be identical to your function’s name.

```js
export function makeStyleGuide() {
  // ...
}
```

#### Use PascalCase when you export a constructor / class / singleton / function library / bare object.

```js
export const GrindCodeStyle = {
  es6: {},
}
```

#### Acronyms and initialisms should always follow camelCase or PascalCase

```js
// bad
import { SMSContainer } from './containers/SMSContainer'

// bad
const HTTPRequests = [
  // ...
]

// good
import { SmsContainer } from './containers/SMSContainer'

// bad (only classes should be PascalCase)
const HttpRequests = [
  // ...
]

// good
const httpRequests = [
  // ...
]

// best
import { TextMessageContainer } from './containers/TextMessageContainer'

// best
const requests = [
  // ...
]
```

## Accessors

#### Accessor functions for properties are not required.

#### If the property/method is a `boolean`, use `isVal()` or `hasVal()`.

```js
// bad
if (!dragon.age()) {
  return false
}

// good
if (!dragon.hasAge()) {
  return false
}
```

## Standard Library

The [Standard Library](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects) contains utilities that are functionally broken but remain for legacy reasons.

#### Use `Number.isNaN` instead of global `isNaN`.

> {tip} Why? The global `isNaN` coerces non-numbers to numbers, returning true for anything that coerces to NaN. If this behavior is desired, make it explicit.

```js
// bad
isNaN('1.2') // false
isNaN('1.2.3') // true

// good
Number.isNaN('1.2.3') // false
Number.isNaN(Number('1.2.3')) // true
```

#### Use `Number.isFinite` instead of global `isFinite`.

> {tip} Why? The global `isFinite` coerces non-numbers to numbers, returning true for anything that coerces to a finite number. If this behavior is desired, make it explicit.

```js
// bad
isFinite('2e3') // true

// good
Number.isFinite('2e3') // false
Number.isFinite(parseInt('2e3', 10)) // true
```
