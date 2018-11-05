import test from 'ava'

import '../src/Command'

import '../src/Input/Input'
import '../src/Input/InputOption'
import '../src/Input/InputArgument'

test('arguments:required', t => {
	const command = new Command
	command.arguments = [
		new InputArgument('arg', InputArgument.VALUE_REQUIRED),
	]

	try {
		command._prepare(new Input([ ]))
		t.fail('Should have thrown an error')
	} catch(err) {
		t.pass()
	}

	command._prepare(new Input([ 'command', 'value' ]))
	t.true(command.containsArgument('arg'))
	t.is(command.argument('arg'), 'value')
})

test('arguments:optional', t => {
	const command = new Command
	command.arguments = [
		new InputArgument('arg', InputArgument.VALUE_OPTIONAL),
	]

	command._prepare(new Input([ 'command' ]))
	t.false(command.containsArgument('arg'))

	command._prepare(new Input([ 'command', 'value' ]))
	t.true(command.containsArgument('arg'))
	t.is(command.argument('arg'), 'value')
})

test('arguments:default', t => {
	const command = new Command
	command.arguments = [
		new InputArgument('arg', InputArgument.VALUE_OPTIONAL, null, 'def')
	]

	command._prepare(new Input([ 'command' ]))
	t.is(command.argument('arg'), 'def')

	command._prepare(new Input([ 'command', 'value' ]))
	t.is(command.argument('arg'), 'value')
})

test('arguments:fallback', t => {
	const command = new Command
	command.arguments = [
		new InputArgument('arg', InputArgument.VALUE_OPTIONAL)
	]

	command._prepare(new Input([ 'command' ]))
	t.is(command.argument('arg'), null)
	t.is(command.argument('arg', 'fall'), 'fall')

	command._prepare(new Input([ 'command', 'value' ]))
	t.is(command.argument('arg'), 'value')
	t.is(command.argument('arg', 'fall'), 'value')
})

test('options:optional', t => {
	const command = new Command
	command.options = [
		new InputOption('opt', InputOption.VALUE_OPTIONAL),
	]

	command._prepare(new Input([ 'command' ]))
	t.false(command.containsOption('opt'))

	command._prepare(new Input([ 'command', '--opt=ion' ]))
	t.true(command.containsOption('opt'))
})

test('options:default', t => {
	const command = new Command
	command.options = [
		new InputOption('opt', InputOption.VALUE_OPTIONAL, null, 5)
	]

	command._prepare(new Input([ 'command' ]))
	t.is(command.option('opt'), 5)

	command._prepare(new Input([ 'command', '--opt=10' ]))
	t.is(command.option('opt'), '10')
})

test('options:fallback', t => {
	const command = new Command
	command.options = [
		new InputOption('opt', InputOption.VALUE_OPTIONAL)
	]

	command._prepare(new Input([ 'command' ]))
	t.is(command.option('opt'), null)
	t.is(command.option('opt', 5), 5)

	command._prepare(new Input([ 'command', '--opt=10' ]))
	t.is(command.option('opt'), '10')
	t.is(command.option('opt', 5), '10')
})

test('options:flag', t => {
	const command = new Command
	command.options = [
		new InputOption('opt', InputOption.VALUE_NONE)
	]

	command._prepare(new Input([ 'command' ]))
	t.is(command.containsOption('opt'), false)
	t.is(command.option('opt'), null)

	command._prepare(new Input([ 'command', '--opt' ]))
	t.is(command.containsOption('opt'), true)
	t.is(command.option('opt'), true)
})
