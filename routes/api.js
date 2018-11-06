const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user')
const Animal = require('../models/animal')
const Cart = require('../models/cart')

const mongoose = require('mongoose')
const db = 'mongodb://rodrigosantos:rodrigo123@ds151753.mlab.com:51753/charlie-dogs'

let AnonymousUser = 0;

mongoose.connect(db, { useNewUrlParser: true }, err => {
    if (err) {
        console.log('Error> ', err)
    } else {
        console.log('Connected to mongodb')
    }
})


router.get('/', (req, res) => {
    res.send('From API route')
})

router.post('/register', (req, res) => {
    let userData = req.body
    let user = new User(userData)
    user.save((err, registerUser) => {
        if (err) {
            console.log(err)
        } else {
            let payload = { subject: registerUser._id }
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({ token })
        }
    })
})

router.post('/setAnonymousToken', (req, res) => {
    //let userData = req.body
    //et AnonymousUser = new User(userData)

    AnonymousUser = AnonymousUser + 1
    console.log("AnonymousUser: ", AnonymousUser)

    let date = new Date()
    console.log(date.getTime())

    let user = "AbCd" + AnonymousUser + date.getTime();

    console.log('user: ', user)

    let payload = { subject: user }
    let token = jwt.sign(payload, 'secretKey')
    console.log('token: ', token)
    res.status(200).send({ token })

})

router.post('/login', (req, res) => {
    let userData = req.body

    User.findOne({ email: userData.email }, (err, user) => {
        if (err) {
            console.log(err)
        } else {
            if (!user) {
                res.status(401).send('Invalid email')
            } else {
                if (user.password !== userData.password) {
                    res.status(401).send('Invalid password')
                } else {
                    let payload = { subject: user._id }
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({ token })
                }
            }
        }
    })
})

router.post('/setAnimal', (req, res) => {
    let animalData =  req.body
    animalData["status"] = "A"
    //console.log('animalData: ', animalData)

    let animal = new Animal(animalData)
    
    animal.save((err, createAnimal) => {
        if (err) {
            console.log(err)
        } else {
            res.status(200).send(createAnimal)
        }
    })
})

router.get('/getAllAnimals', async (req, res) => {

    let filhotes = []

    Animal.find({ status: "A" }, (err, animals) => {
        animals.forEach(animal => {
            filhotes.push(animal);
        })
        //console.log('filhotes: ', filhotes)
        res.json(filhotes)
    })

    // filhotes = [
    //     {
    //         "_id": "1",
    //         "image": "http://www.filhotesonlinebh.com.br/system/app/webroot/img/produtos/1540846271.jpg",
    //         "raca": "YorkShire",
    //         "dtNasc": "2018-10-23T18:25:43.511Z",
    //         "sexo": "Macho",
    //         "valor": "1.000,00",
    //     },
    //     {
    //         "_id": "2",
    //         "image": "http://www.filhotesonlinebh.com.br/system/app/webroot/img/produtos/1540928812.jpg",
    //         "raca": "Shih Tzu",
    //         "dtNasc": "2018-10-25T18:25:43.511Z",
    //         "sexo": "Macho",
    //         "valor": "1.100,00",
    //     },
    //     {
    //         "_id": "3",
    //         "image": "http://www.filhotesonlinebh.com.br/system/app/webroot/img/produtos/1540652131.jpg",
    //         "raca": "Maltes",
    //         "dtNasc": "2018-10-27T18:25:43.511Z",
    //         "sexo": "Femea",
    //         "valor": "840,50",
    //     },
    //     {
    //         "_id": "4",
    //         "image": "http://www.filhotesonlinebh.com.br/system/app/webroot/img/produtos/1538593071.jpg",
    //         "raca": "Pug",
    //         "dtNasc": "2018-10-20T18:25:43.511Z",
    //         "sexo": "Femea",
    //         "valor": "1600,00",
    //     },
    //     {
    //         "_id": "5",
    //         "image": "http://www.filhotesonlinebh.com.br/system/app/webroot/img/produtos/1539721412.jpg",
    //         "raca": "YorkShire",
    //         "dtNasc": "2018-10-20T18:25:43.511Z",
    //         "sexo": "Femea",
    //         "valor": "1600,00",
    //     },
    // ]

    // console.log('filhotes: ', filhotes)
    // res.json(filhotes)


})


router.get('/searchAnimal', (req, res) => {

    let query = req.query.query
    let filhotes = []

    Animal.find({ raca: { $regex: query + '.*', $options: 'i' }, status: "A" }, (err, animals) => {
        animals.forEach(animal => {
            filhotes.push(animal);
        })
        //console.log('filhotes: ', filhotes)
        res.json(filhotes)
    })

})

router.post('/removeAnimal', (req, res) => {

    let animalData = req.body
    let animal = new Animal(animalData)
    console.log('animal: ', animal)

    Animal.deleteOne({ _id: animal._id }, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log('animal removed!');
            res.status(200).send(animal)
        }
    });
})

router.post('/buyAnimal', async (req, res) => {

    let animalData = req.body.animal
    let token = req.body.token

    let payload = jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauthorized request')
    }
    let user = payload.subject
    console.log('user: ', user)

    let cartData = new Cart()
    let animal = new Animal(animalData)

    cartData = {
        idUser: user,
        image: animal.image,
        raca: animal.raca,
        dtNasc: animal.dtNasc,
        sexo: animal.sexo,
        valor: animal.valor,
    }

    await Animal.findByIdAndUpdate(animal._id, { status: "V" }, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log('animal updated!');
            //res.status(200).send(animal)
        }
    });

    let cart = new Cart(cartData)
    await cart.save((err, data) => {
        if (err) {
            console.log(err)
        } else {
            res.status(200).send(data)
        }
    })
})

router.get('/getCart', (req, res) => {

    let query = req.query.query
    console.log('query: ', query)
    let cart = []

    Cart.find({ idUser: { $regex: query + '.*', $options: 'i' } }, (err, data) => {
        data.forEach(row => {
            cart.push(row);
        })
        res.json(cart)
    })

})
module.exports = router