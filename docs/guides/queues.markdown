# Queues
Grind’s [Queue provider](https://github.com/grindjs/queue) is built on [Kue](https://github.com/Automattic/kue) internally, however Grind provides a much different interace so it feels right at home within the Grind ecosystem.

## Setting Up the Queue
### Integrating with Grind
To setup your Grind app to use Queue, simple install via NPM and register in bootstrap:

```shell
npm install --save grind-queue
```

```js
import Grind from 'grind-framework'
import { QueueProvider } from 'grind-queue'

const app = new Grind()
app.providers.push(QueueProvider)
```

### Configuring
To configure your queue, create `config/queue.json`:
```json
{

	"default": "redis",

	"connections": {

		"redis": {
			"prefix": "q", // Default prefix for the Queue
			"redis": {
				"host": "127.0.0.1",
				"port": 6379,
				"auth": null
			}
		}

	}

}
```

## Building Jobs
The most important of any Queue system is the ability to actually create and dispatch jobs.  Grind’s Queue uses Job classes to provide a singular source for working with a job.  When dispatching, you’ll create a new instance of your Job class and then when it’s time for the job to be processed, the `$handle` method will be called.

## Job Generator
The fastest way to create a new job is by using the job generator via `bin/cli make:job`.  To quick generate a new job, run the following in your project directory:
```shell
bin/cli make:job EmailJob
```

This will generate an EmailJob class and place it at `app/Jobs/EmailJob.js`.

## Job Class
Now that your Job has been created, it’ll look like this:
```js
import { Job } from 'grind-queue'

export class EmailJob extends Job {
	static jobName = 'email-job'

	$handle(app, queue) {
		//
	}

}
```

#### jobName
This is the name of job, it’s used within the queue to determine the type of job during querying and dispatching so the job goes to the correct class.

#### $handle(app, queue)
The `$handle` method is what will be called when your job is invoked by the processor.  For our `EmailJob` job, this is where we’d actually send the email.

`$handle` is invoked with two different parameters:

* `app`: The Grind app instance
* `queue`: The queue instance this job was dispatched on

#### id
```js
get id()
```

For jobs that have already been created, you can call `job.id` to get the id of the job.

## Customizing the Job
There are a number of additional methods in the Job class to let you fine tune your job:

#### $priority
```js
$priority(level)
```

`$priority` allows you to set the priority of the job.  It accepts a single `level` parameter that can either be an integer or a priority name.

Priority names map as follows:
* `low => 10`
* `normal => 0`
* `medium => -5`
* `high => -10`
* `critical => -15`

#### $delay
```js
$delay(milliseconds)
```

`$delay` provides a way to delay a job before it’s processed.  By default there will not be any delays, so if the queue is empty immediately upon dispatching a job, it will be available for processing.
* `milliseconds` — Number of milliseconds to delay the job

#### $attempts
```js
$attempts(attempts)
```

`$attempts` controls how many times a failed job will be retried before permanently failing.
* `attempts` — number of times a job should be retried before failing

#### $backoff
```js
$backoff(value)
```

`$backoff` works with `$attempts` and allows control over how long of a gap there should be between retrying a job.

The value for `$backoff` supports a few different configurations:
```js
// Honor job’s original delay (if set) at each attempt, defaults to fixed backoff
job.$attempts(3).$backoff(true)

// Override delay value, fixed backoff
job.$attempts(3).$backoff({
	delay: 60 * 1000,
	type: 'fixed'
})

// Enable exponential backoff using original delay (if set)
job.$attempts(3).$backoff({
	type:'exponential'
})

// Use a function to get a customized next attempt delay value
job.$attempts(3).$backoff((attempts, delay)  => {
	return 600
})
```

Note that when you pass in a function it will be eval’d and not called directly — do not attempt to use any variables/application context outside of the function.

#### $ttl
```js
$ttl(milliseconds)
```

Using `$ttl` you can set how a long job remains in the queue before it expires.
* `milliseconds` — Number of milliseconds a job can remain in the queue before being expired.

#### $save
```js
$save(queue)
```

`$save` is used to update an existing job before it’s been processed.
* `queue` — The queue argument is only necessary for new jobs. For jobs that have already been dispatched, no value is needed.

`$save` will return a promise that will resolve/fail once the job has been updated or placed in the queue

#### $toJson
```js
$toJson()
```

`$tojson()` is an override point to convert the current job class to JSON before it’s stored in the queue. If your job overrides this, be sure to call super first.

### Job Defaults
Many of the above methods have a corresponding static property you can set on the job class to provide a default value:
```js
export class EmailJob extends Job {
	static jobName = 'email-job'

	static priority = 'normal'
	static removeOnComplete = true
	static attempts = 1
	static backoff = null
	static concurrency = 1
}
```

## Registering a Job
Before you can use a job, you’ll first need to register it.  Jobs should be registered in `app/Providers/JobsProvider.js`:
```js
import 'App/Jobs/EmailJob'

export function JobsProvider(app) {
	app.queue.register(EmailJob)
}
```

If you haven’t already created the `JobsProvider` be sure to register it in Bootstrap, for more information on this see the [Providers guide](providers#registering-providers).

## Dispatching Jobs
To dispatch a job, you’ll create a job instance and call `app.queue.dispatch(job)`:
```js
sendEmail(req, res) {
	return this.app.queue.dispatch(new EmailJob({
		email: req.body.email,
		subject: req.body.subject,
		body: req.body.body,
	})).then(() => res.send({ success: true }))
}
```

### Delaying a Job
```js
app.queue.dispatch(new EmailJob({ ... }).$delay(1000)) // Delays EmailJob by 1s
```

### Processing Jobs
To process jobs you’ve added to the queue, Grind provides a simple `queue:work` command:
```shell
bin/cli queue:work
```

Once invoked, the command will stay running and process jobs as they arrive in the queue.  For large queues, you can run this on multiple servers to maximize performance.

You can also limit the command to only process a single job, allowing for discrete workers:
```shell
bin/cli queue:work --job=email-job
```

Once this is ran, it will only process the `EmailJob` jobs.

## Querying Jobs
You can look up existing jobs by id or using the query builder.

## Retrieve a Single Job
To retrieve a single job from the queue, use `queue.fetchJob`:
```js
app.queue.fetchJob(687).then(job => {
	job.body = 'Updated email body…'
	return job.$save()
})
```

This will fetch job 687 from the queue, update the body and save it.

## Using the Query Builder
To retrieve multiple jobs at once, use the query builder via `queue.query()`.  The query builder class has the following methods:

> **NOTE:** All methods in the query builder are chainable.

#### state
```js
state(state)
```

Restrict jobs by their current state.
* `state` — The state for the Jobs you want to restrict to

Valid states are:
* `active`
* `inactive`
* `failed`
* `complete`

#### for
```js
for(jobClass)
```

Using `for` you can restrict which types of jobs you want to query for by passing in a Job class.
* `jobClass` — The class for the Jobs you want to restrict to

> **NOTE:** At this time, you can’t use `for()` without also using `state()`.

#### limit
```js
limit(limit)
```

Limit the number of jobs returned
* `limit` — Number of jobs to return

#### offset
```js
offset(offset)
```

* `offset` — Number of jobs to skip

#### orderBy
```js
orderBy(orderBy)
```

* `orderBy` — Direction to sort jobs, acceptable values are`asc` or `desc`


#### first
```js
first()
```

Calling `first()` at the end of a query will return a promise that will resolve to the first job in a query.


## Query Builder Examples
```js
// Get a list of jobs being processed:
this.app.queue.query().for(EmailJob).state('active').then(jobs => {
	for(const job of jobs) {
		Log.comment('Currently sending', job.toJSON())
	}
})

// Fetch and update the first inactive job:
this.app.queue.query().for(EmailJob).state('inactive').first(job => {
	job.body = 'Updated email body…'
	return job.$save()
})
```
