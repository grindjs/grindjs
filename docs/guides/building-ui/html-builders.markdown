# HTML Builders
When building frontend apps, Grind has a handy [HTML provider](https://github.com/grindjs/html) that provides `html` and `form` builder objects to your views.

> As Grind’s HTML provider was ported from [Laravel](https://github.com/LaravelCollective/html), these docs were ported from [Laravel’s docs](https://github.com/laravel/docs/blob/4.2/html.md) as well.

## Opening A Form
```twig
{{ from.open({ url: 'foo/bar' }) }}
	//
{{ from.close() }}
```

By default, a `POST` method will be assumed however, you are free to specify another method:
```twig
{{ form.open({ url: 'foo/bar', method: 'put' }) }}
```

> Since HTML forms only support `POST` and `GET`, `PUT` and `DELETE` methods will be spoofed by automatically adding a `_method` hidden field to your form.You may also open forms that point to named routes:

```twig
{{ form.open({ route: 'route.name' }) }}
```

You may pass in route parameters as well:
```twig
{{ form.open({ route: [ 'route.name', user.id ] }) }}
```

If your form is going to accept file uploads, add a `files` option to your array:
```twig
{{ form.open({ url: 'foo/bar', files: true)) }}
```

## Form Model Binding
Often, you will want to populate a form based on the contents of a model. To do so, use the `form.model` method:
```twig
{{ form.model(user, { route: [ 'user.update', user.id ]}) }}
```

Now, when you generate a form element, like a text input, the model's value matching the field's name will automatically be set as the field value. So, for example, for a text input named `email`, the user model's `email` attribute would be set as the value. However, there's more! If there is an item in the Session flash data matching the input name, that will take precedence over the model's value. So, the priority looks like this:

1. Session Flash Data (Old Input)
2. Explicitly Passed Value
3. Model Attribute Data

This allows you to quickly build forms that not only bind to model values, but easily re-populate if there is a validation error on the server!

> When using `form.model`, be sure to close your form with `form.close`!

## Labels
### Generating A Label Element
```twig
{{ form.label('email', 'E-Mail Address') }}
```

### Specifying Extra HTML Attributes
```twig
{{ form.label('email', 'E-Mail Address', { class: 'awesome' }) }}
```

> After creating a label, any form element you create with a name matching the label name will automatically receive an ID matching the label name as well.

## Text, Text Area, Password & Hidden Fields
### Generating A Text Input
```twig
{{ form.text('username') }}
```

### Specifying A Default Value
```twig
{{ form.text('email', 'example@gmail.com') }}
```

> The *hidden* and *textarea* methods have the same signature as the *text* method.### Generating A Password Input

```twig
{{ form.password('password') }}
```

### Generating Other Inputs
```twig
{{ form.email(name, value, attributes) }}
{{ form.file(name, attributes) }}
```

## Checkboxes and Radio Buttons
### Generating A Checkbox Or Radio Input
```twig
{{ form.checkbox('name', 'value') }}
{{ form.radio('name', 'value') }}
```

### Generating A Checkbox Or Radio Input That Is Checked
```twig
{{ form.checkbox('name', 'value', true) }}
{{ form.radio('name', 'value', true) }}
```

## Number
### Generating A Number Input
```twig
{{ form.number('name', 'value') }}
```

## File Input
### Generating A File Input
```twig
{{ form.file('image') }}
```

> The form must have been opened with the `files` option set to `true`.

## Drop-Down Lists
### Generating A Drop-Down List
```twig
{{ form.select('size', { L: 'Large', S: 'Small' }) }}
```

### Generating A Drop-Down List With Selected Default
```twig
{{ form.select('size', { L: 'Large', S: 'Small' }, 'S') }}
```

### Generating A Grouped List
```twig
{{ form.select('animal', {
	Cats: { leopard: 'Leopard' },
	Dogs: { spaniel: 'Spaniel' },
}) }}
```

### Generating A Drop-Down List With A Range
```twig
{{ form.selectRange('number', 10, 20) }}
```

### Generating A List With Month Names
```twig
{{ form.selectMonth('month') }}
```

## Buttons
### Generating A Submit Button
```twig
{{ echo form.submit('Click Me!') }}
```

> Need to create a button element? Try the *button* method. It has the same signature as *submit*.
