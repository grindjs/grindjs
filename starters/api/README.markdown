# Grind API Example

## Installation

```bash
git clone git@github.com:shnhrrsn/grind-api-example.git
cd grind-api-example
npm install
./db migrate:latest
./db seed:run
```

## Running

```bash
npm run serve # For a single worker
npm run cluster # For multiple workers
```

You should now be able to go to [http://localhost:3000/states](http://localhost:3000/states).

Other URLs:

 * Paged: [http://localhost:3000/states?limit=10](http://localhost:3000/states?limit=10)
 * Individual: [http://localhost:3000/states/ny](http://localhost:3000/states/ny)
 * Search: [http://localhost:3000/states/search?term=new](http://localhost:3000/states/search?term=new)
 * Swagger: [http://petstore.swagger.io/?url=http://localhost:3000/swagger.json](http://petstore.swagger.io/?url=http://localhost:3000/swagger.json)

## Deployments

```bash
npm run build
npm run cluster-build
```
