# Redis

Grind supports a global `redis.json` config file that abstracts away  the various differences in configuring Redis-capable providers and gives you a unified place to manage your Redis connections in a concise manner:

**config/redis.json**

```json
{
	"default": "redis",
	"connections": {
		"redis": {
			"host": "localhost",
			"port": 6379,
			"password": null
		}
	}
}
```

## Supported Providers

The Redis config file is currently supported in Grind by the following providers:

- [Queue](queues#configuring)
- [Cache](cache)
- Session middleware

> {note} Shared connections between providers to Redis is not currently supported as each package implements Redis differently.  PR’s are absolutely welcome to resolve this!
