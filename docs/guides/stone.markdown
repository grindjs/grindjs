# Stone Templates

Stone is Grind‘s official templating engine, it’s based on [Laravel Blade](https://laravel.com/docs/master/blade).  Stone compiles your templates into pure Javascript to minimize any overhead.  In fact, any time you’re inside of a Stone directive or displaying data, you’re writing Javascript.  Stone view files use the `.stone` file extension and should be stored in the `resources/views` directory.

> {tip} As Stone is based on Laravel Blade, much of the documentation below was originally ported from [Laravel’s docs](https://github.com/laravel/docs/blob/5.4/blade.md).

[[toc]]

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

### Extending A Layout

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

Of course, you are not limited to displaying the contents of the variables passed to the view. You may also display the results of any JS expression. In fact, you can put any JS code you wish inside of a Stone echo statement:

```stone
<p>The current UNIX timestamp is {{ Date.now() }}.</p>
```

#### Displaying Unescaped Data

By default, Stone `{{ }}` statements are automatically pased through the [entities](https://www.npmjs.com/package/entities) package to prevent XSS attacks. If you do not want your data to be escaped, you may use the following syntax:

```stone
<p>Hello, {!! name !!}.</p>
```

> {note} Be very careful when echoing content that is supplied by users of your application. Always use the escaped, double curly brace syntax to prevent XSS attacks when displaying user supplied data.

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

> {tip} `@spaceless` is applied during compilation, so there‘s no real world performance cost!

### Inspecting Objects

During the course of development, you’ll more than likely run into a scenario where you want to see what the contents of an object are.

Stone solves this with a `@dump` directive that will `stringify` the object and render it in a `pre` tag:

```stone
@dump({
	title: 'Grind'
})
```

## Variable Assignemnts

Stone‘s `@set` directive allows you to assign variables within the current context.  These assignments will cascade downwards to subviews via `@include`, however an assignment within a subview will not affect it’s parent.

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

	@if(user.id == 5)
		@break
	@endif
@endforeach
```

You may also include the condition with the directive declaration in one line:

```stone
@for(const user of users)
	@continue(user.type === 1)

	<li>{{ user.name }}</li>

	@break(user.number === 5)
@endforeach
```

### Comments

Stone also allows you to define comments in your views. However, unlike HTML comments, Stone comments are not included in the HTML returned by your application:

```stone
{{-- This comment will not be present in the rendered HTML --}}
```

## Including Sub-Views

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

This enables you to create powerful extensions, but can be a little confusing at first.  For instance, as seen above, in order for your custom directive to display data in the view, it must append the `output` variable.

The `output` variable is a special variable that will exist in every circumstance and contains all HTML and non-Stone directives that will be rendered.
