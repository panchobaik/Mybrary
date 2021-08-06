
const express = require('express');
const Author = require('../models/author');
const router = express.Router();


// All authors Route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name !== null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }

    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query,
        });
    } catch {
        res.redirect('/');
    }
    
});

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create Author Route
router.post('/', async (req, res) => {

    const author = new Author({
        name: req.body.name, // posting된 body에서 name을 추출해서, name에 적용
    });

    try {
        const newAuthor = await author.save();
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect('authors');
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        });
    }
    /*
    author.save((err, newAuthor) => {
        if (err) {
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error creating Author'
            });
        } else {
            //res.redirect(`authors/${newAuthor.id}`);
            res.redirect('authors');
        }
    });
    */
    //res.send('Create');
    
    //res.send(req.body.name); // posting된 body에서 name을 추출
});

module.exports = router;