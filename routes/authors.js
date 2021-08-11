const express = require('express');
const Author = require('../models/author');
const Book = require('../models/book');
const router = express.Router();

// All authors Route + Search Author
router.get('/', async (req, res) => {

    let searchOptions = {};
    if (req.query.name !== null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i'); //RegExp : req.query.name 같은 string pattern을 가지는 constructor생성
        //console.log('searchOptions = ');
        //console.log(searchOptions);
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
    console.log('What is req?');
    console.log(req.body);
    console.log('What is res?');
    console.log(res);
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
});

// Show Author + 특정 path를 저장된 author id값으로 설정. 이때, ":"는 id를 변수로 선언 + ":id" is going to be passed along with our request
router.get('/:id', async (req, res) => {
    try {
        // params gives us all parameters that we define inside of our URL paths
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books,
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Edit Author + 저장된 author id값을 사용해서 특정 author 내용을 edit
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author});
    } catch {
        res.redirect('/authors');
    }
});

// Update Author + routes를 update하기 위해서 "put" 사용
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();    
        //res.redirect(`/authors/${author.id}`);
        res.redirect('/authors');

    } catch {
        if (author == null) {
            res.redirect('/');
        } else if (author.name == req.body.name) { 
            //정상적으로 author.name이 새로운 이름으로 변경확인후 authorSchema.pre('save', ~)을 통해 책 등록에 이미 적용된 author name 변경 방지
            res.render('authors/edit', {
                author: author,
                errorMessage: `Error Updating Author: ${author.name} has books still`,
            });

        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error Updating Author',
            });
        }
    }
});

// Delete Author 
router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');

    } catch {
        if (author == null) {
            res.redirect('/');
        } else {
            //res.redirect(`/authors/${author.id}`);
            res.send(`Error Deleting Author : ${author.name} has books still`);
        }
    }
});

module.exports = router;