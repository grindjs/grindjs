---
title: "HTML Builders"
excerpt: ""
---
When building frontend apps, Grind has a handy [HTML provider](https://github.com/grindjs/html) that provides `html` and `form` builder objects to your views.
[block:callout]
{
  "type": "info",
  "body": "As Grind’s HTML provider was ported from [Laravel](https://github.com/LaravelCollective/html), these docs were ported from [Laravel’s docs](https://github.com/laravel/docs/blob/4.2/html.md) as well."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Opening A Form"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "{{ from.open({ url: 'foo/bar' }) }}\n\t//\n{{ from.close() }}",
      "language": "jinja2"
    }
  ]
}
[/block]
By default, a `POST` method will be assumed however, you are free to specify another method:
[block:code]
{
  "codes": [
    {
      "code": "{{ form.open({ url: 'foo/bar', method: 'put' }) }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Since HTML forms only support `POST` and `GET`, `PUT` and `DELETE` methods will be spoofed by automatically adding a `_method` hidden field to your form."
}
[/block]
You may also open forms that point to named routes:
[block:code]
{
  "codes": [
    {
      "code": "{{ form.open({ route: 'route.name' }) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
You may pass in route parameters as well:
[block:code]
{
  "codes": [
    {
      "code": "{{ form.open({ route: [ 'route.name', user.id ] }) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
If your form is going to accept file uploads, add a `files` option to your array:
[block:code]
{
  "codes": [
    {
      "code": "{{ form.open({ url: 'foo/bar', files: true)) }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Form Model Binding"
}
[/block]
Often, you will want to populate a form based on the contents of a model. To do so, use the `form.model` method:
[block:code]
{
  "codes": [
    {
      "code": "{{ form.model(user, { route: [ 'user.update', user.id ]}) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
Now, when you generate a form element, like a text input, the model's value matching the field's name will automatically be set as the field value. So, for example, for a text input named `email`, the user model's `email` attribute would be set as the value. However, there's more! If there is an item in the Session flash data matching the input name, that will take precedence over the model's value. So, the priority looks like this:

1. Session Flash Data (Old Input)
2. Explicitly Passed Value
3. Model Attribute Data

This allows you to quickly build forms that not only bind to model values, but easily re-populate if there is a validation error on the server!
[block:callout]
{
  "type": "info",
  "body": "When using `form.model`, be sure to close your form with `form.close`!"
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Labels"
}
[/block]
### Generating A Label Element
[block:code]
{
  "codes": [
    {
      "code": "{{ form.label('email', 'E-Mail Address') }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Specifying Extra HTML Attributes
[block:code]
{
  "codes": [
    {
      "code": "{{ form.label('email', 'E-Mail Address', { class: 'awesome' }) }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "After creating a label, any form element you create with a name matching the label name will automatically receive an ID matching the label name as well."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Text, Text Area, Password & Hidden Fields"
}
[/block]
### Generating A Text Input
[block:code]
{
  "codes": [
    {
      "code": "{{ form.text('username') }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Specifying A Default Value
[block:code]
{
  "codes": [
    {
      "code": "{{ form.text('email', 'example@gmail.com') }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "The *hidden* and *textarea* methods have the same signature as the *text* method."
}
[/block]
### Generating A Password Input
[block:code]
{
  "codes": [
    {
      "code": "{{ form.password('password') }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating Other Inputs
[block:code]
{
  "codes": [
    {
      "code": "{{ form.email(name, value, attributes) }}\n{{ form.file(name, attributes) }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Checkboxes and Radio Buttons"
}
[/block]
### Generating A Checkbox Or Radio Input
[block:code]
{
  "codes": [
    {
      "code": "{{ form.checkbox('name', 'value') }}\n{{ form.radio('name', 'value') }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating A Checkbox Or Radio Input That Is Checked
[block:code]
{
  "codes": [
    {
      "code": "{{ form.checkbox('name', 'value', true) }}\n{{ form.radio('name', 'value', true) }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Number"
}
[/block]
### Generating A Number Input
[block:code]
{
  "codes": [
    {
      "code": "{{ form.number('name', 'value') }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "File Input"
}
[/block]
### Generating A File Input
[block:code]
{
  "codes": [
    {
      "code": "{{ form.file('image') }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "The form must have been opened with the `files` option set to `true`."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Drop-Down Lists"
}
[/block]
### Generating A Drop-Down List
[block:code]
{
  "codes": [
    {
      "code": "{{ form.select('size', { L: 'Large', S: 'Small' }) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating A Drop-Down List With Selected Default
[block:code]
{
  "codes": [
    {
      "code": "{{ form.select('size', { L: 'Large', S: 'Small' }, 'S') }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating A Grouped List
[block:code]
{
  "codes": [
    {
      "code": "{{ form.select('animal', {\n\tCats: { leopard: 'Leopard' },\n\tDogs: { spaniel: 'Spaniel' },\n}) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating A Drop-Down List With A Range
[block:code]
{
  "codes": [
    {
      "code": "{{ form.selectRange('number', 10, 20) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
### Generating A List With Month Names
[block:code]
{
  "codes": [
    {
      "code": "{{ form.selectMonth('month') }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Buttons"
}
[/block]
### Generating A Submit Button
[block:code]
{
  "codes": [
    {
      "code": "{{ echo form.submit('Click Me!') }}",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Need to create a button element? Try the *button* method. It has the same signature as *submit*."
}
[/block]