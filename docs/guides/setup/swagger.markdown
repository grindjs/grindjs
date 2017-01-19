---
title: "Swagger"
excerpt: ""
---
[block:callout]
{
  "type": "info",
  "body": "This is applicable only to API projects, which include Swagger by default.  Web projects could add Swagger if they wanted, but it’s of minimal value."
}
[/block]
If you’re building an API, proper documentation is just as important as performance.  Unfortunately, maintaining docs is time consuming and they frequently become outdated.

In order to encourage full documentation of endpoints in APIs built with Grind, Grind has a [Swagger provider](https://github.com/grindjs/swagger) that provides first class [Swagger](http://swagger.io) integration into Grind routes via a `/swagger.json` endpoint.

By building Swagger docs directly into routes, it reduces time and effort involved in creating and maintaining API documentation.
[block:api-header]
{
  "type": "basic",
  "title": "Documenting Routes"
}
[/block]
Grind will only expose routes that are explicitly documented for Swagger.

You can document your routes for Swagger by passing a `swagger` object to third param when registering a route:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/states', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of states',\n\t\tparameters: [\n\t\t\t{\n\t\t\t\tname: 'limit',\n\t\t\t\tin: 'query',\n\t\t\t\trequired: false,\n\t\t\t\tdescription: 'Limit the number of records',\n\t\t\t\ttype: 'integer'\n\t\t\t}, {\n\t\t\t\tname: 'offset',\n\t\t\t\tin: 'query',\n\t\t\t\trequired: false,\n\t\t\t\tdescription: 'Skip records before querying',\n\t\t\t\ttype: 'integer'\n\t\t\t}\n\t\t]\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Inferred Route Documentation"
}
[/block]
The previous example uses the Swagger spec directly, which is a bit verbose and repetitive. Fortunately, Grind’s implementation of Swagger can infer quite a bit for you for you:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/:state/cities/:letter?', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of cities in a state',\n\t\tparameters: {\n\t\t\tstate: 'State abbreviation',\n\t\t\tletter: 'Letter to filter cities by',\n\t\t\tlimit: {\n\t\t\t\tdescription: 'Limit the number of records',\n\t\t\t\ttype: 'integer'\n\t\t\t},\n\t\t\toffset: {\n\t\t\t\tdescription: 'Skip records before querying',\n\t\t\t\ttype: 'integer'\n\t\t\t}\n\t\t}\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Based on this, the following can be inferred:

* `state` is a required string parameter that appears in the URL
* `letter` is an optional string parameter that may appear in the URL
* `limit` and `offset` are optional query string parameters

### How Inference Works

* `letter` is inferred as optional due to the route param’s trailing `?`.  `state` is a non-optional parameter, making it required.
* If no type is provided, the following rules are used (in order):
	1. If the name starts with `has_` or `is_`, the type is inferred as `boolean`
	2. If the name is `id` or ends with `_id`, the type is inferred as `integer`
	3. All other parameters types are inferred as `string`
* `limit` and `offset` are inferred as _optional_ query parameters because they don’t appear in the route path and this is a `GET` request.
* For non-`GET` requests, parameters that don’t appear in the route path are inferred as _required_ `body` parameters.
* All rules that are explicitly defined will take precedence over any inferred rules.

### Teaching

You can help inference by ‘teaching’ it.  This is useful for common keywords that have the same type, but will differ in their descriptions.
[block:code]
{
  "codes": [
    {
      "code": "import Swagger from 'grind-swagger'\n\nSwagger.learn('featured', { type: 'boolean') })\nSwagger.learn('limit', { type: 'integer') })\nSwagger.learn('offset', { type: 'integer') })\n\napp.routes.get('/states', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of states',\n\t\tparameters: {\n\t\t\tfeatured: 'Filter states by whether or not they’re featured',\n\t\t\tlimit: 'Limit the number of states returned',\n\t\t\toffset: 'Number of states to skip before querying'\n\t\t}\n\t}\n})\n\napp.routes.get('/:state/cities', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of cities in a state',\n\t\tparameters: {\n\t\t\tstate: 'State abbreviation',\n\t\t\tfeatured: 'Filter cities by whether or not they’re featured',\n\t\t\tlimit: 'Limit the number of cities returned',\n\t\t\toffset: 'Number of cities to skip before querying'\n\t\t}\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Without teaching, `featured`, `limit` and `offset` would have had their type inferred as `string`.  By teaching, their type is correctly inferred as `boolean`, `integer` and `integer` respectively.
[block:api-header]
{
  "type": "basic",
  "title": "Shared Parameters"
}
[/block]
No one wants to clutter their code with a bunch of repetitive documentation.  To avoid this, you can define shared parameters (and groups of parameters) to use within your routes:
[block:code]
{
  "codes": [
    {
      "code": "import Swagger from 'grind-swagger'\n\n// Register a single parameter\nSwagger.parameter('state', {\n\tname: 'state',\n\tin: 'url',\n\trequired: true,\n\tdescription: 'State abbreviation',\n\ttype: 'string'\n})\n\n// Register a group of parameters\nSwagger.parameters('pagination', [\n\t{\n\t\tname: 'limit',\n\t\tin: 'query',\n\t\trequired: false,\n\t\tdescription: 'Limit the number of records',\n\t\ttype: 'integer'\n\t}, {\n\t\tname: 'offset',\n\t\tin: 'query',\n\t\trequired: false,\n\t\tdescription: 'Skip records before querying',\n\t\ttype: 'integer'\n\t}\n])\n\n// Now you can reuse these quickly:\napp.routes.get('/:state/cities/:letter?', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of cities in a state',\n\t\tuse: [ 'state', 'pagination' ]\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Shared parameters can also take advantage of inference, allowing for far more concise and readable code:
[block:code]
{
  "codes": [
    {
      "code": "import Swagger from 'grind-swagger'\n\nSwagger.parameter('state', 'State abbreviation')\nSwagger.parameters('pagination', {\n\tlimit: {\n\t\tdescription: 'Limit the number of records',\n\t\ttype: 'integer'\n\t},\n\toffset: {\n\t\tdescription: 'Skip records before querying',\n\t\ttype: 'integer'\n\t}\n])\n\napp.routes.get('/:state/cities/:letter?', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of cities in a state',\n\t\tuse: [ 'state', 'pagination' ]\n\t}\n})\n",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Shared Parameters vs Teaching"
}
[/block]
`Swagger.parameter` and `Swagger.learn` have a bit in common in that they can share common documentation between multiple routes, however they differ in how they should be used:

* Shared parameters should be used when you’re looking to include documentation for a parameter that is shared between different routes ‘as-is’.
* Teaching should be used when you’re just trying to improve inferring and you’re still planning to describe your parameters.

Here’s an example of shared parameters working together with teaching:
[block:code]
{
  "codes": [
    {
      "code": "import Swagger from 'grind-swagger'\n\n// Documentation of what “featured” is will change\n// from route to route, so we just teach the type\nSwagger.learn('featured', { type: 'boolean' })\n\n// Documentation for pagination is shared, so we\n// define the group of params and reuse as-is.\nSwagger.parameters('pagination', {\n\tlimit: {\n\t\tdescription: 'Limit the number of records',\n\t\ttype: 'integer'\n\t},\n\toffset: {\n\t\tdescription: 'Skip records before querying',\n\t\ttype: 'integer'\n\t}\n])\n\napp.routes.get('/states', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of states',\n\t\tuse: [ 'pagination' ],\n\t\tparameters: {\n\t\t\tfeatured: 'Filter states by featured'\n\t\t}\n\t}\n})\n\napp.routes.get('/:state/cities', 'index', {\n\tswagger: {\n\t\tdescription: 'Gets a list of cities in a state',\n\t\tuse: [ 'pagination' ],\n\t\tparameters: {\n\t\t\tstate: 'Abbreviation of a state'\n\t\t\tfeatured: 'Filter cities by featured'\n\t\t}\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]