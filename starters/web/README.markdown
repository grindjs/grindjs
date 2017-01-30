# Grind Example Web

## Installation

```bash
git clone https://github.com/grindjs/example-web.git grind-example-web
cd grind-example-web
npm install
```

## Running

```bash
# Use `watch` to automatically restart the server on file changes
# Watch is recommended for development
bin/cli watch

# Use `serve --cluster` to launch a cluster of workers
# Cluster is recommended for production
bin/cli serve --cluster

# Use `serve` to launch a single worker
bin/cli serve
```

You should now be able to go to [localhost:3100](http://localhost:3100).
