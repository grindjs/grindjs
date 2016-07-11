# Grind Example API

## Installation

```bash
git clone https://github.com/grindjs/example-api.git grind-example-api
cd grind-example-api
npm install
bin/cli migrate:latest
bin/cli db:seed
```

## Running

```bash
# Use `watch` to automatically restart the server on file changes
# Watch is recommended for development
bin/watch

# Use `serve --cluster` to launch a cluster of workers
# Cluster is recommended for production
bin/serve --cluster

# Use `serve` to launch a single worker
bin/serve
```

You should now be able to go to [localhost:3000/states](http://localhost:3000/states).

Other URLs:

 * Paged: [localhost:3000/states?limit=10](http://localhost:3000/states?limit=10)
 * Individual: [localhost:3000/states/ny](http://localhost:3000/states/ny)
 * Search: [localhost:3000/states/search?term=new](http://localhost:3000/states/search?term=new)
 * Swagger: [petstore.swagger.io/?url=http://localhost:3000/swagger.json](http://petstore.swagger.io/?url=http://localhost:3000/swagger.json)
