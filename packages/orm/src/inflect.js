import i from 'i'

export const inflect = Object.assign({ }, i())

const foreignKey = inflect.foreign_key
delete inflect.foreign_key

inflect.foreignKey = val => foreignKey(val.replace(/Model$/, ''))