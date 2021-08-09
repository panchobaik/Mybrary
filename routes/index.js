
const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => { // idex.ejs 디자인을 통해 Recently Added된 최대 10개 book들 display
    //res.send('Hello World');
    let books;

    try {
        books = await Book.find().sort({createdAt: 'desc'}).limit(5).exec();
    } catch {
        books = [];
    }
    res.render('index', { books: books });
});

module.exports = router;