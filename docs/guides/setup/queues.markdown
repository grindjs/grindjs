---
title: "Queues"
excerpt: ""
---
Grind’s [Queue provider](https://github.com/grindjs/queue) is built on [Kue](https://github.com/Automattic/kue) internally, however Grind provides a much different interace so it feels right at home within the Grind ecosystem.
[block:api-header]
{
  "type": "basic",
  "title": "Setting Up the Queue"
}
[/block]
### Integrating with Grind

To setup your Grind app to use Queue, simple install via NPM and register in bootstrap:
[block:code]
{
  "codes": [
    {
      "code": "npm install --save grind-queue",
      "language": "shell"
    }
  ]
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "import Grind from 'grind-framework'\nimport { QueueProvider } from 'grind-queue'\n\nconst app = new Grind()\napp.providers.push(QueueProvider)",
      "language": "javascript",
      "name": "app/Bootstrap.js"
    }
  ]
}
[/block]
### Configuring

To configure your queue, create `config/queue.json`:
[block:code]
{
  "codes": [
    {
      "code": "{\n\n\t\"default\": \"redis\",\n\n\t\"connections\": {\n\n\t\t\"redis\": {\n\t\t\t\"prefix\": \"q\", // Default prefix for the Queue\n\t\t\t\"redis\": {\n\t\t\t\t\"host\": \"127.0.0.1\",\n\t\t\t\t\"port\": 6379,\n\t\t\t\t\"auth\": null\n\t\t\t}\n\t\t}\n\n\t}\n\n}",
      "language": "json"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Building Jobs"
}
[/block]
The most important of any Queue system is the ability to actually create and dispatch jobs.  Grind’s Queue uses Job classes to provide a singular source for working with a job.  When dispatching, you’ll create a new instance of your Job class and then when it’s time for the job to be processed, the `$handle` method will be called.

## Job Generator
The fastest way to create a new job is by using the job generator via `bin/cli make:job`.  To quick generate a new job, run the following in your project directory:
[block:code]
{
  "codes": [
    {
      "code": "bin/cli make:job EmailJob",
      "language": "shell"
    }
  ]
}
[/block]
This will generate an EmailJob class and place it at `app/Jobs/EmailJob.js`.

## Job Class
Now that your Job has been created, it’ll look like this:
[block:code]
{
  "codes": [
    {
      "code": "import { Job } from 'grind-queue'\n\nexport class EmailJob extends Job {\n\tstatic jobName = 'email-job'\n\n\t$handle(app, queue) {\n\t\t//\n\t}\n\n}",
      "language": "javascript",
      "name": "app/Jobs/EmailJob.js"
    }
  ]
}
[/block]
### jobName

This is the name of job, it’s used within the queue to determine the type of job during querying and dispatching so the job goes to the correct class.

### $handle(app, queue)

The `$handle` method is what will be called when your job is invoked by the processor.  For our `EmailJob` job, this is where we’d actually send the email.

`$handle` is invoked with two different parameters:

* `app`: The Grind app instance
* `queue`: The queue instance this job was dispatched on

### id
[block:code]
{
  "codes": [
    {
      "code": "get id()",
      "language": "javascript"
    }
  ]
}
[/block]
For jobs that have already been created, you can call `job.id` to get the id of the job.

## Customizing the Job

There are a number of additional methods in the Job class to let you fine tune your job:

### $priority
[block:code]
{
  "codes": [
    {
      "code": "$priority(level)",
      "language": "javascript"
    }
  ]
}
[/block]
`$priority` allows you to set the priority of the job.  It accepts a single `level` parameter that can either be an integer or a priority name.

Priority names map as follows:

* `low => 10`
* `normal => 0`
* `medium => -5`
* `high => -10`
* `critical => -15`

### $delay
[block:code]
{
  "codes": [
    {
      "code": "$delay(milliseconds)",
      "language": "javascript"
    }
  ]
}
[/block]
`$delay` provides a way to delay a job before it’s processed.  By default there will not be any delays, so if the queue is empty immediately upon dispatching a job, it will be available for processing.

* `milliseconds` — Number of milliseconds to delay the job

### $attempts
[block:code]
{
  "codes": [
    {
      "code": "$attempts(attempts)",
      "language": "javascript"
    }
  ]
}
[/block]
`$attempts` controls how many times a failed job will be retried before permanently failing.

* `attempts` — number of times a job should be retried before failing

### $backoff
[block:code]
{
  "codes": [
    {
      "code": "$backoff(value)",
      "language": "javascript"
    }
  ]
}
[/block]
`$backoff` works with `$attempts` and allows control over how long of a gap there should be between retrying a job.

The value for `$backoff` supports a few different configurations:
[block:code]
{
  "codes": [
    {
      "code": "// Honor job’s original delay (if set) at each attempt, defaults to fixed backoff\njob.$attempts(3).$backoff(true)\n\n// Override delay value, fixed backoff\njob.$attempts(3).$backoff({\n\tdelay: 60 * 1000,\n\ttype: 'fixed'\n})\n\n// Enable exponential backoff using original delay (if set)\njob.$attempts(3).$backoff({\n\ttype:'exponential'\n})\n\n// Use a function to get a customized next attempt delay value\njob.$attempts(3).$backoff((attempts, delay)  => {\n\treturn 600\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Note that when you pass in a function it will be eval’d and not called directly — do not attempt to use any variables/application context outside of the function.

### $ttl
[block:code]
{
  "codes": [
    {
      "code": "$ttl(milliseconds)",
      "language": "javascript"
    }
  ]
}
[/block]
Using `$ttl` you can set how a long job remains in the queue before it expires.

* `milliseconds` — Number of milliseconds a job can remain in the queue before being expired.

### $save
[block:code]
{
  "codes": [
    {
      "code": "$save(queue)",
      "language": "javascript"
    }
  ]
}
[/block]
`$save` is used to update an existing job before it’s been processed.

* `queue` — The queue argument is only necessary for new jobs. For jobs that have already been dispatched, no value is needed.

`$save` will return a promise that will resolve/fail once the job has been updated or placed in the queue

### $toJson
[block:code]
{
  "codes": [
    {
      "code": "$toJson()",
      "language": "javascript"
    }
  ]
}
[/block]
`$tojson()` is an override point to convert the current job class to JSON before it’s stored in the queue. If your job overrides this, be sure to call super first.

### Job Defaults

Many of the above methods have a corresponding static property you can set on the job class to provide a default value:
[block:code]
{
  "codes": [
    {
      "code": "export class EmailJob extends Job {\n\tstatic jobName = 'email-job'\n\n\tstatic priority = 'normal'\n\tstatic removeOnComplete = true\n\tstatic attempts = 1\n\tstatic backoff = null\n\tstatic concurrency = 1\n}",
      "language": "javascript",
      "name": "app/Jobs/EmailJob.js"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Registering a Job"
}
[/block]
Before you can use a job, you’ll first need to register it.  Jobs should be registered in `app/Providers/JobsProvider.js`:
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Jobs/EmailJob'\n\nexport function JobsProvider(app) {\n\tapp.queue.register(EmailJob)\n}",
      "language": "javascript",
      "name": "app/Providers/JobsProvider.js"
    }
  ]
}
[/block]
If you haven’t already created the `JobsProvider` be sure to register it in Bootstrap, for more information on this see the [Providers guide](doc:providers#registering-providers).
[block:api-header]
{
  "type": "basic",
  "title": "Dispatching Jobs"
}
[/block]
To dispatch a job, you’ll create a job instance and call `app.queue.dispatch(job)`:
[block:code]
{
  "codes": [
    {
      "code": "sendEmail(req, res) {\n\treturn this.app.queue.dispatch(new EmailJob({\n\t\temail: req.body.email,\n\t\tsubject: req.body.subject,\n\t\tbody: req.body.body,\n\t})).then(() => res.send({ success: true }))\n}",
      "language": "javascript",
      "name": "app/Controllers/EmailController.js"
    }
  ]
}
[/block]
### Delaying a Job
[block:code]
{
  "codes": [
    {
      "code": "app.queue.dispatch(new EmailJob({ ... }).$delay(1000)) # Delays EmailJob by 1s",
      "language": "javascript"
    }
  ]
}
[/block]
### Processing Jobs

To process jobs you’ve added to the queue, Grind provides a simple `queue:work` command:
[block:code]
{
  "codes": [
    {
      "code": "bin/cli queue:work",
      "language": "shell"
    }
  ]
}
[/block]
Once invoked, the command will stay running and process jobs as they arrive in the queue.  For large queues, you can run this on multiple servers to maximize performance.

You can also limit the command to only process a single job, allowing for discrete workers:
[block:code]
{
  "codes": [
    {
      "code": "bin/cli queue:work --job=email-job",
      "language": "shell"
    }
  ]
}
[/block]
Once this is ran, it will only process the `EmailJob` jobs.
[block:api-header]
{
  "type": "basic",
  "title": "Querying Jobs"
}
[/block]
You can look up existing jobs by id or using the query builder.

## Retrieve a Single Job

To retrieve a single job from the queue, use `queue.fetchJob`:
[block:code]
{
  "codes": [
    {
      "code": "app.queue.fetchJob(687).then(job => {\n\tjob.body = 'Updated email body…'\n\treturn job.$save()\n})",
      "language": "javascript"
    }
  ]
}
[/block]
This will fetch job 687 from the queue, update the body and save it.

## Using the Query Builder

To retrieve multiple jobs at once, use the query builder via `queue.query()`.  The query builder class has the following methods:
[block:callout]
{
  "type": "info",
  "body": "**NOTE:** All methods in the query builder are chainable."
}
[/block]
### state
[block:code]
{
  "codes": [
    {
      "code": "state(state)",
      "language": "javascript"
    }
  ]
}
[/block]
Restrict jobs by their current state.

* `state` — The state for the Jobs you want to restrict to

Valid states are:

* `active`
* `inactive`
* `failed`
* `complete`

### for
[block:code]
{
  "codes": [
    {
      "code": "for(jobClass)",
      "language": "javascript"
    }
  ]
}
[/block]
Using `for` you can restrict which types of jobs you want to query for by passing in a Job class.

* `jobClass` — The class for the Jobs you want to restrict to
[block:callout]
{
  "type": "warning",
  "body": "**NOTE:** At this time, you can’t use `for()` without also using `state()`."
}
[/block]
### limit
[block:code]
{
  "codes": [
    {
      "code": "limit(limit)",
      "language": "javascript"
    }
  ]
}
[/block]
Limit the number of jobs returned

* `limit` — Number of jobs to return

### offset
[block:code]
{
  "codes": [
    {
      "code": "offset(offset)",
      "language": "javascript"
    }
  ]
}
[/block]
* `offset` — Number of jobs to skip

### orderBy
[block:code]
{
  "codes": [
    {
      "code": "orderBy(orderBy)",
      "language": "javascript"
    }
  ]
}
[/block]
* `orderBy` — Direction to sort jobs, acceptable values are`asc` or `desc`


### first
[block:code]
{
  "codes": [
    {
      "code": "first()",
      "language": "javascript"
    }
  ]
}
[/block]
Calling `first()` at the end of a query will return a promise that will resolve to the first job in a query.


## Query Builder Examples
[block:code]
{
  "codes": [
    {
      "code": "// Get a list of jobs being processed:\nthis.app.queue.query().for(EmailJob).state('active').then(jobs => {\n\tfor(const job of jobs) {\n\t\tLog.comment('Currently sending', job.toJSON())\n\t}\n})\n\n// Fetch and update the first inactive job:\nthis.app.queue.query().for(EmailJob).state('inactive').first(job => {\n\tjob.body = 'Updated email body…'\n\treturn job.$save()\n})",
      "language": "javascript"
    }
  ]
}
[/block]