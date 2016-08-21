# grind-orm

`grind-orm` is an ORM provider for [Grind](https://github.com/grindjs/framework) powered by [Objection.js](http://vincit.github.io/objection.js).

## Installation

Add `grind-orm` to your project:

```bash
npm install grind-orm grind-db --save
```

## Usage

To use `grind-orm` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind-framework'
import {DatabaseProvider} from 'grind-db'
import {OrmProvider} from 'grind-orm'

const app = new Grind()
app.providers.push(DatabaseProvider)
app.providers.push(OrmProvider)
```

See [grind.readme.io/docs/orm](https://grind.readme.io/docs/orm) for more information on how to use `grind-orm`.
