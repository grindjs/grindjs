# HTML Builders
When building frontend apps, Grind has a handy [HTML provider](https://github.com/grindjs/html) that provides `html` and `form` builder objects to your views.

> {tip} As Grind’s HTML provider was ported from [Laravel](https://github.com/LaravelCollective/html), these docs were ported from [Laravel’s docs](https://github.com/laravel/docs/blob/4.2/html.md) as well.

[[toc]]

## Opening a Form
```njk
{{ from.open({ url: 'foo/bar' }) }}
	//
{{ from.close() }}
```

By default, a `POST` method will be assumed however, you are free to specify another method:
```njk
{{ form.open({ url: 'foo/bar', method: 'put' }) }}
```

> {tip} Since HTML forms only support `POST` and `GET`, `PUT` and `DELETE` methods will be spoofed by automatically adding a `_method` hidden field to your form.You may also open forms that point to named routes:

```njk
{{ form.open({ route: 'route.name' }) }}
```

You may pass in route parameters as well:
```njk
{{ form.open({ route: [ 'route.name', user.id ] }) }}
```

If your form is going to accept file uploads, add a `files` option to your array:
```njk
{{ form.open({ url: 'foo/bar', files: true)) }}
```

## Form Model Binding
Often, you will want to populate a form based on the contents of a model. To do so, use the `form.model` method:
```njk
{{ form.model(user, { route: [ 'user.update', user.id ]}) }}
```

Now, when you generate a form element, like a text input, the model's value matching the field's name will automatically be set as the field value. So, for example, for a text input named `email`, the user model's `email` attribute would be set as the value. However, there's more! If there is an item in the Session flash data matching the input name, that will take precedence over the model's value. So, the priority looks like this:

1. Session Flash Data (Old Input)
2. Explicitly Passed Value
3. Model Attribute Data

This allows you to quickly build forms that not only bind to model values, but easily re-populate if there is a validation error on the server!

> {note} When using `form.model`, be sure to close your form with `form.close`!

## Labels
### Generating a Label Element
```njk
{{ form.label('email', 'E-Mail Address') }}
```

### Specifying Extra HTML Attributes
```njk
{{ form.label('email', 'E-Mail Address', { class: 'awesome' }) }}
```

> {tip} After creating a label, any form element you create with a name matching the label name will automatically receive an ID matching the label name as well.

## Text, Text Area, Password & Hidden Fields
### Generating a Text Input

```njk
{{ form.text('username') }}
{{ form.textarea('body') }}
```

#### Specifying a Default Value

```njk
{{ form.text('email', 'example@gmail.com') }}
```

### Generation a Hidden Input

```njk
{{ form.hidden('id', 10) }}
```

### Generating a Password Input

```njk
{{ form.password('password') }}
```

### Generating Other Inputs
```njk
{{ form.email(name, value, attributes) }}
{{ form.file(name, attributes) }}
```

## Checkboxes and Radio Buttons
### Generating a Checkbox Or Radio Input
```njk
{{ form.checkbox('name', 'value') }}
{{ form.radio('name', 'value') }}
```

### Generating a Checkbox Or Radio Input That Is Checked
```njk
{{ form.checkbox('name', 'value', true) }}
{{ form.radio('name', 'value', true) }}
```

## Number
### Generating a Number Input
```njk
{{ form.number('name', 'value') }}
```

## File Input
### Generating a File Input
```njk
{{ form.file('image') }}
```

> {note} The form must have been opened with the `files` option set to `true`.

## Drop-Down Lists
### Generating a Drop-Down List
```njk
{{ form.select('size', { L: 'Large', S: 'Small' }) }}
```

### Generating a Drop-Down List With Selected Default
```njk
{{ form.select('size', { L: 'Large', S: 'Small' }, 'S') }}
```

### Generating a Grouped List
```njk
{{ form.select('animal', {
	Cats: { leopard: 'Leopard' },
	Dogs: { spaniel: 'Spaniel' },
}) }}
```

### Generating a Drop-Down List With a Range
```njk
{{ form.selectRange('number', 10, 20) }}
```

### Generating a List With Month Names
```njk
{{ form.selectMonth('month') }}
```

## Buttons
### Generating a Submit Button
```njk
{{ echo form.submit('Click Me!') }}
```

> {tip} Need to create a button element? Try the *button* method. It has the same signature as *submit*.
