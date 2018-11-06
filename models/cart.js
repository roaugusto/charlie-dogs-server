const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
    idUser: String,
    image: String,
    raca: String,
    dtNasc: String,
    sexo: String,
    valor: String,
})

module.exports = mongoose.model('cart', cartSchema, 'carts')