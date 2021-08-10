const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// Cover image file을 uploading하기 위한 multer 모듈 적용
//const multer = require('multer');
const path = require('path');
const fs = require('fs'); // file system
const uploadPath = path.join('public', Book.coverImageBasePath); //path.join을 통해 public 폴더 내 'uploads/bookCovers'를 연결
/*
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const storage = multer.diskStorage({ // public디렉토리에 upload된 cover image의 파일명 (filename) 설정
    destination: uploadPath, //upload path inside of this project
    filename: (req, file, callback) => {
        let fileExt = file.originalname.substring(file.originalname.lastIndexOf('.'),file.originalname.length);
        let indx = file.originalname.indexOf('.');
        let fileName = file.originalname.substring(0, indx);
        callback(null, fileName + '-' + Date.now() + fileExt);
    },
    fileFilter: (req, file, callback) => { //fileFilter allows us to actually filter which files our server accepts
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

const upload = multer({
    
   // destination: uploadPath, //upload path inside of this project
    //fileFilter: (req, file, callback) => { //fileFilter allows us to actually filter which files our server accepts
    //    callback(null, imageMimeTypes.includes(file.mimetype));
   // }, 
    storage: storage,
});
*/

// All Books Route + Search Book : views > index.ejs 
router.get('/', async (req, res) => {
    
    // searching 조건문 : title + publishDate
    let query = Book.find();
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); //RegExp : req.query.title 같은 string pattern을 가지는 constructor생성
    }

    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        // lte : less than or equal
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        // gte : greater than or equal
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {
        // async 함수 실행 후 결과를 얻기 위해서 반드시 await 적용
        //const books = await Book.find({}); // mongoDB의 Book table에 저장된 모든 book 정보
        const books = await query.exec(); // 특정 query 조건을 통해 얻은 book정보만 적용
        res.render('books/index', {
            books: books,
            searchOptions: req.query,
        })
    } catch {
        res.redirect('/');
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Create Book Route
// upload.single('cover') => single file인 'cover'를 uploading : outer.post('/', upload.single('cover'), async (req, res)
// File Encode plugin 적용 후 ,upload.single('cover') 제거 
router.post('/', async (req, res) => {

    const fileName = req.file != null ? req.file.filename : null; //uploading되는 cover image의 이름으로 부터 fileName 설정
    
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    }); 
    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect('books');
        console.log('req.file = ');
        console.log(req.file);
    } catch {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

function removeBookCover(fileName) {
    // fs.unlink method is used to remove a file or symbolic link from the filesystem.
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err); // err would be thrown if the method fails
    });
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book,
        }
        if (hasError) params.errorMessage = 'Error Creating Book';
        //const book = new Book(); // create new book
        res.render('books/new', params); //Passing variables into new.ejs (from views)
            
    } catch {
        res.redirect('/books'); //error발생될때, localhost:3000/books 페이지로 redirect
    } 
}

module.exports = router;