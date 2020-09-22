# Stone Templates

Stone is Grind’s official templating engine, it’s based on [Laravel Blade](https://laravel.com/docs/master/blade). Stone compiles your templates into pure Javascript to minimize any overhead. In fact, any time you’re inside of a Stone directive or displaying data, you’re writing Javascript. Stone view files use the `.stone` file extension and should be stored in the `resources/views` directory.

> {tip} As Stone is based on Laravel Blade, much of the documentation below was originally ported from [Laravel’s docs](https://github.com/laravel/docs/blob/5.4/blade.md).

[[toc]]

## Displaying Data

You may display data passed to your Stone views by wrapping the variable in curly braces. For example, given the following route:

```js
app.routes.get('greeting', (req, res) => {
  return res.render('welcome', { name: 'Taylor' })
})
```

You can display the contents of the `name` variable by surrounding it with two curly braces:

```stone
<p>Hello, {{ name }}.</p>
```

Of course, you are not limited to displaying the contents of the variables passed to the view. You may also display the results of any JS expression. In fact, you can put any JS code you wish inside of a Stone output statement:

```stone
<p>The current UNIX timestamp is {{ Date.now() }}.</p>
```

#### Displaying Unescaped Data

By default, Stone `{{ }}` statements are automatically passed through the [he](https://www.npmjs.com/package/he) package to prevent XSS attacks. If you do not want your data to be escaped, you may use the following syntax:

```stone
<p>Hello, {!! name !!}.</p>
```

> {note} Be very careful when outputting content that is supplied by users of your application. Always use the escaped, double curly brace syntax to prevent XSS attacks when displaying user supplied data.

### Escaping Braces

You may use the `@` symbol to inform the Stone rendering engine an expression should remain untouched. For example:

```stone
<h1>Stone</h1>
<p>Hello, @{{ name }}.</p>
```

In this example, the `@` symbol will be removed by Stone; however, the `{{ name }}` expression will remain untouched by the Stone engine.

### Controlling Whitespace

Stone has a `@spaceless` directive that allows you to strip all whitespace between HTML tags:

```stone
@spaceless
<nav>
	<span>Home</span>
	<span>Posts</span>
	<span>Contact</span>
</nav>
@endspaceless
```

The above example will render as:

```html
<nav><span>Home</span><span>Posts</span><span>Contact</span></nav>
```

> {tip} `@spaceless` is applied during compilation, so there’s no real world performance cost!

### Inspecting Objects

During the course of development, you’ll more than likely run into a scenario where you want to see what the contents of an object are.

Stone solves this with a `@dump` directive that will `stringify` the object and render it in a `pre` tag:

```stone
@dump({
	title: 'Grind'
})
```

## Layouts & Sections

### Defining A Layout

Two of the primary benefits of using Stone are _template inheritance_ and _sections_. To get started, let’s take a look at a simple example. First, we will examine a “master” page layout. Since most web applications maintain the same general layout across various pages, it’s convenient to define this layout as a single Stone view:

```stone
<!-- Stored in resources/views/layout/app.stone -->
<html>
	<head>
		<title>App Name - @yield('title')</title>
	</head>
	<body>
		@section('sidebar')
			This is the master sidebar.
		@show

		<div class="container">
			@yield('content')
		</div>
	</body>
</html>
```

As you can see, the Stone view contains typical HTML markup. However, take note of the `@section` and `@yield` directives. The `@section` directive, as the name implies, defines a section of content, while the `@yield` directive is used to display the contents of a given section.

Now that we have defined a layout for our app, let’s define a child view that inherits the layout.

### Extending a Layout

When defining a child view, use the Stone `@extends` directive to specify which layout the child view should “inherit”. Views which extend a Stone layout may inject content into the layout’s sections using `@section` directives. Remember, as seen in the example above, the contents of these sections will be displayed in the layout using `@yield`:

```stone
<!-- Stored in resources/views/child.stone -->
@extends('layout.app')

@section('title', 'Page Title')

@section('sidebar')
	@super

	<p>This is appended to the master sidebar.</p>
@endsection

@section('content')
	<p>This is my body content.</p>
@endsection
```

In this example, the `sidebar` section is utilizing the `@super` directive to append (rather than overwriting) content to the layout’s sidebar. The `@super` directive will be replaced by the content of the layout when the view is rendered.

### Layout Introspection

You may also determine if a given layout section has any content using the `@hasSection` directive:

```stone
<title>
	@hasSection('title')
		@yield('title') - Grind
	@else
		Grind
	@endif
</title>
```

## Components & Slots

Components and slots provide similar benefits to sections and layouts; however, they can provide a simpler interface for reusable code throughout your app. You can use components with layouts, and layouts with components.

As an example, consider an “alert” component used throughout your application:

**resources/views/shared/alert.stone**

```stone
<div class="alert alert-danger">
	{{ slot }}
</div>
```

The `{{ slot }}` variable will contain the content we wish to inject into the component. Now, to construct this component, we can use the `@component` Stone directive:

```stone
@component('shared.alert')
	<strong>Whoops!</strong> Something went wrong!
@endcomponent
```

Sometimes it is helpful to define multiple slots for a component. Let’s modify our alert component to allow for the injection of a “title”. Named slots may be displayed by simply outputting the variable that matches their name:

**resources/views/shared/alert.stone**

```stone
<div class="alert alert-danger">
	<div class="alert-title">{{ title }}</div>

	{{ slot }}
</div>
```

Now, we can inject content into the named slot using the `@slot` directive. Any content not within a `@slot` directive will be passed to the component in the `slot` variable:

```stone
@component('shared.alert')
	@slot('title')
		Forbidden
	@endslot

	You are not allowed to access this resource!
@endcomponent
```

> {tip} For simple slot assignments such as above, you can pass a second parameter to keep it as one line: `@slot('tile', 'Forbidden')`

#### Passing Additional Data To Components

Sometimes you may need to pass additional data to a component. For this reason, you can pass an array of data as the second argument to the `@component` directive. All of the data will be made available to the component template as variables:

```stone
@component('alert',  { foo: 'bar' })
	{{-- … --}}
@endcomponent
```

#### Advantages Over Layouts

Since components don‘t have any explicit hierarchy like layouts do (they’re really just simple templates after all), you’re even to render content exactly the same using `@include`:

```stone
@include('shared.alert', {
	title: 'Forbidden',
	slot: 'You are not allowed to access this resource!'
})
```

This isn’t practical for every scenario (as soon as you start including HTML tags you’ll want to leverage the `@component` directive), but it’s easy to see how powerful and flexible components can be in your app.

## Tagged Components

Tagged Components provide all of the benefits of the regular component syntax, but via HTML tags:

```stone
<app-modal position="center">
	<h1>Grind Framework</h1>
	<p>Aren’t tagged components cool?</p>
</app-modal>
```

This is effectively the same as doing the following (in fact, behind the scenes, it’s what Stone turns it into):

```stone
@component('shared.app-modal', {
	position: 'center'
})
	<h1>Grind Framework</h1>
	<p>Aren’t tagged components cool?</p>
@endcomponent
```

> {tip} Tagged Components are handled during compilation, so there is no runtime performance hit!

### Registering Tags

As you may have noticed, tagged components are referenced by just a single tag name like `app-modal` and not the full path we use with components (`shared.app-modal`).

In order to use tagged components, you must first tell Stone about them. The easiest way to do this is via your View config:

```json
// config/view.json
{
  "tags": {
    "app-modal": "shared.app-modal"
  }
}
```

The object key (`app-modal`) becomes your component tag and it’s value (`shared.app-modal`) is the view that is loaded.

While you can define tagged components one by one, this may become a little cumbersome as you start creating more of them. To alleviate this process, you can register tags via wildcards:

```json
{
  "tags": {
    "shared.tags": "*"
  }
}
```

Using the wildcard syntax, all views within `shared/tags` will be registered as tags. Take the following directory structure:

```
views
└─ shared
   └─ tags
      ├─ alert.stone
      ├─ app-modal.stone
      └─ popover.stone
```

Using the above config, the following will be automatically registered:

- `shared.tags.alert` is registered as `alert`
- `shared.tags.app-modal` is registered as `app-modal`
- `shared.tags.popover` is registered as `popover`

### Passing Data

#### Simple Values

You pass data to your component by setting attributes on the tag, just like any other HTML tag:

```stone
<app-modal position="center" />
```

`app-modal` will be called with the context `{ position: 'center' }`.

#### Variables

If you need to pass variables to the component, you can do so by surrounding the attribute value with braces instead of quotes:

```stone
<app-modal position="center" title={title} />
```

`app-modal` will be called with the context `{ position: 'center', title: title }`.

#### Spread

You can also pass an entire object to a component using spread syntax:

```stone
<app-modal position="center" { ...attributes } />
```

`app-modal` will be called with the context `{ position: 'center', ...attributes }`.

### Nesting and Composition

Tagged components support full nesting and composition, just like any other HTML tag or component.

By using the [`slot` variable](#components-slots), we can build flexible components:

```stone
{{-- fancy-border.stone --}}
<div class="fancy-border fancy-border-{{ color || 'green' }}">
	{{ slot }}
</div>
```

This lets other components pass arbitrary elements to them by nesting the tags:

```stone
{{-- welcome-dialog.stone --}}
<fancy-border color="blue">
	<h1 class="dialog-title">Welcome</h1>
	<p class="dialog-message">Thank you for visiting our spacecraft!</p>
</fancy-border>
```

Anything inside the `<fancy-border>` tag gets passed into the `fancy-border` component via the `slot` variable. Since `<fancy-border>` renders `{{ slot }}` inside of it‘s `<div>`, the passed elements appear in the final output.

### Slots

Looking back to our earlier `alert` component, you’ll see there are multiple slots:

```stone
<div class="alert alert-danger">
	<div class="alert-title">{{ title }}</div>

	{{ slot }}
</div>
```

This is supported in tagged components via a special `<slot:name>` tag, where `name` is the name of the slot:

```stone
<alert>
	<slot:title><strong>Uh oh!</strong> Forbidden</slot:title>
	You are not allowed to access this resource!
</alert>
```

> {note} Slot tags do not support attributes.

### Specialization

Sometimes we think about components as being “special cases” of other components. For example, we might say that a `welcome-dialog` is a special case of `dialog`.

With components, this is also achieved by composition, where a more “specific” component renders a more “generic” one and configures it with attributes:

```stone
{{-- dialog.stone --}}
<fancy-border color="blue">
	<h1 class="dialog-title">{{ title }}</h1>
	<p class="dialog-message">{{ message }}</p>
</fancy-border>

{{-- welcome-dialog.stone --}}
<dialog
	title="Welcome"
	message="Thank you for visiting our spacecraft!" />
```

### Attribute Passthrough

All templates have a special `$local` variable that contains _only_ the context explicitly passed to them. When using this with tagged components, it gives us pretty powerful functionality.

In the above example, if you were to pass extra attributes to `fancy-border`, it gets lost:

```stone
<fancy-border
	color="blue"
	class="my-extra-class"
	data-id="welcome-dialog"
>
	{{-- ... --}}
</fancy-border>
```

If we modify our `fancy-border` component to leverage `$local` and `html.attributes`, we can allow full customization of the component:

```stone
@set(const { color = 'green', class = '', ...attrs }, $local)
<div
	class="fancy-border fancy-border-{{ color }} {{ class }}"
	{{ html.attributes(attrs) }}
>
	{{ slot }}
</div>
```

Now when calling `fancy-border` with the extra attributes, it’ll render as expected:

```stone
<div
	class="fancy-border fancy-border-blue my-extra-class"
	data-id="welcome-dialog"
>
	{{-- ... --}}
</div>
```

## Variable Assignemnts

Stone’s `@set` directive allows you to assign variables within the current context. These assignments will cascade downwards to subviews via `@include`, however an assignment within a subview will not affect it’s parent.

```stone
{{-- @set supports simple assignments: --}}
@set(title, 'Grind')

{{-- With @set you can also assign an object property: --}}
@set(object, { title: Grind })
@set(object.version, 1.0)

{{-- @set even supports pushing values onto an array: --}}
@set(versions, [ 1.0, 2.0 ])
@set(versions.push(3.0))
```

## Control Structures

In addition to template inheritance and displaying data, Stone also provides convenient shortcuts for common control structures, such as conditional statements and loops. These shortcuts provide a very clean, terse way of working with control structures, while also remaining familiar to their Javascript counterparts.

### If Statements

You may construct `if` statements using the `@if`, `@elseif`, `@else`, and `@endif` directives. These directives function identically to their JS counterparts:

```stone
@if(records.length === 1)
	I have one record!
@elseif(records.length > 1)
	I have multiple records!
@else
	I don't have any records!
@endif
```

For convenience, Stone also provides an `@unless` directive:

```stone
@unless(user)
	You are not signed in.
@endunless
```

### Loops

In addition to conditional statements, Stone provides simple directives for working with loop structures. Again, each of these directives functions identically to their JS counterparts:

```stone
@for(let i = 0; i < 10; i++)
	The current value is {{ i }}
@endfor

@for(const user of users)
	<p>This is user {{ user.id }}</p>
@endfor

@while(true)
	<p>I'm looping forever.</p>
@endwhile
```

When using loops you may also end the loop or skip the current iteration:

```stone
@for(const user of users)
	@if(user.type === 1)
		@continue
	@endif

	<li>{{ user.name }}</li>

	@if(user.id === 5)
		@break
	@endif
@endfor
```

You may also include the condition with the directive declaration in one line:

```stone
@for(const user of users)
	@continue(user.type === 1)

	<li>{{ user.name }}</li>

	@break(user.number === 5)
@endfor
```

#### The Loop Variable

When using `for of` and `for in` loops, a magic `loop` variable is made available. This variable provides quick access to the context of the loop, such as the current index and whether this is the first or last iteration through the loop:

```stone
@for(const user of users)
	@if(loop.first)
		This is the first iteration.
	@endif

	@if(loop.last)
		This is the last iteration.
	@endif

	<p>This is user {{ user.id }}</p>
@endfor
```

If you are in a nested loop, the parent loop’s loop variable is also available via the `parent` property:

```stone
@for(const user of users)
	@for(const post of user.posts)
		@if(loop.parent.first)
			This is first iteration of the parent loop.
		@endif
	@endfor
@endfor
```

The loop variable also contains a variety of other useful properties:

| Property       | Description                                            |
| -------------- | ------------------------------------------------------ |
| loop.index     | The index of the current loop iteration (starts at 0). |
| loop.iteration | The current loop iteration (starts at 1).              |
| loop.remaining | The iteration remaining in the loop.                   |
| loop.length    | The total number of items being iterated.              |
| loop.first     | Whether this is the first iteration through the loop.  |
| loop.last      | Whether this is the last iteration through the loop.   |
| loop.depth     | The nesting level of the current loop.                 |
| loop.parent    | When in a nested loop, the parent’s loop variable.     |

### Comments

Stone also allows you to define comments in your views. However, unlike HTML comments, Stone comments are not included in the HTML returned by your application:

```stone
{{-- This comment will not be present in the rendered HTML --}}
```

## Including Views

Stone’s `@include` directive allows you to include a Stone view from within another view. All variables that are available to the parent view will be made available to the included view:

```stone
<div>
	@include('shared.errors')

	<form><!-- … --></form>
</div>
```

Even though the included view will inherit all data available in the parent view, you may also pass an object of extra data to the included view:

```stone
@include('view.name', {
	some: 'data'
})
```

### Rendering Views For Collections

Stone has a helpful `@each` directive that combines the `@for` and `@include` directives into a single one line statement:

```stone
@each('view.name', jobs, 'job')
```

- The first argument is the view partial to render for each element in the collection.
- The second argument is the array or collection you wish to iterate over.
- The third argument is the variable name that will be assigned to the current iteration within the view. So, for example, if you are iterating over an array of jobs, typically you will want to access each job as a `job` variable within your view partial.

> {tip} Use `@each` where possible when looping and displaying views as it’s able to make runtime optimizations to speed up the rendering of your views that aren’t available by doing a standard `@for`/`@include` pattern.

#### Empty Collections

You may also pass a fourth argument to the `@each` directive. This argument determines the view that will be rendered if the collection is empty:

```stone
@each('view.name', jobs, 'job', 'view.empty')
```

If you’d prefer to render a raw string, you can prefix the argument with `raw|`:

```stone
@each('view.name', jobs, 'job', 'raw|There are no jobs.')
```

#### Additional Context

Finally, there is a fifth parameter that you can pass to send extra data to either your view partials or the empty view:

```stone
@each('view.name', jobs, 'job', 'view.empty', {
	section: 'Jobs'
})
```

## Macros

The `@macro` directive enables you to define reusable blocks of code within your templates:

```stone
@macro('avatar' user, size = 'large')
<span class="avatar avatar-{{ size }}">
	<img src="{{ user.avatar }}" />
</span>
@endmacro
```

The first parameter of `@macro` is the name of the macro, all subsequent parameters are arguments for your macro. You can define these as you would any function in JS, including default values and even destructuring.

Once defined, you can use the macro anywhere within the same template or included templates by calling it as a function using the name you defined in the first parameter of `@macro`:

```stone
{{ avatar(post.user) }}
```

## Extending Stone

Stone allows you to define your own custom directives using the `directive` method. When the Stone compiler encounters the custom directive, it will call the provided callback with the expression that the directive contains.

The following example creates a `@style(href)` directive which formats a given `href` to a `link` tag:

```js
export function StoneExtensionProvider(app) {
  app.view.extend('style', args => {
    return `output += '<link media="all" type="text/css" rel="stylesheet" href="${args}" />';`
  })
}
```

When you add a custom directive, Stone expends you to return **valid** Javascript.

This enables you to create powerful extensions, but can be a little confusing at first. For instance, as seen above, in order for your custom directive to display data in the view, it must append the `output` variable.

The `output` variable is a special variable that will exist in every circumstance and contains all HTML and non-Stone directives that will be rendered.

## Editor Support

Currently, Stone is supported by Atom and Sublime Text. If you’ve added support for Stone for another editor, but sure to submit a PR to have it listed here.

### Atom

To enable support for Stone in Atom, install the `language-stone` package.

### Sublime Text

To enable support for Stone in Sublime Text, first add the repository to [Package Control](https://packagecontrol.io/installation):

1. Open Package Control via `<cmd>`+`<shift>`+`<p>`
2. Go to `Package Control: Add Repository`
3. Enter https://github.com/grindjs/stone-editor-sublime

Once you’ve added the repository, you can install it by searching `stone-editor-sublime`:

1. Open Package Control via `<cmd>`+`<shift>`+`<p>`
2. Go to `Package Control: Install Package`
3. Then enter `stone-editor-sublime`
