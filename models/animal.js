const mongoose = require('mongoose')
const Schema = mongoose.Schema

const animalSchema = new Schema({
    image: String,
    raca: String,
    dtNasc: String,
    sexo: String,
    valor: String,
    status: String,
})

module.exports = mongoose.model('animal', animalSchema, 'animals')