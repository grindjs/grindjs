# Grind API Example

## Dependencies

Install the following if you don’t already have them.

##### NodeJS
```bash
brew update
brew install nodejs
```

##### CoffeeScript

```bash
npm install coffee-script -g
```

##### Nodemon

```bash
npm install nodemon -g
```

## Installation

```bash
git clone git@github.com:shnhrrsn/grind-api-example.git
cd grind-api-example
npm install
node_modules/grind-db/bin/grind-db migrate:latest
node_modules/grind-db/bin/grind-db seed:run
```

## Running

```bash
nodemon app/serve.coffee # For a single worker
nodemon app/worker.coffee # For multiple workers
```

You should now be able to go to [http://localhost:3000/states](http://localhost:3000/states).

Other URLs:

 * Paged: [http://localhost:3000/states?limit=10](http://localhost:3000/states?limit=10)
 * Individual: [http://localhost:3000/states/ny](http://localhost:3000/states/ny)
 * Search: [http://localhost:3000/states/search?term=new](http://localhost:3000/states/search?term=new)

## Deployments

```bash
cake build # Compiles all coffee to JS
node app-compiled/cluster.js
```
