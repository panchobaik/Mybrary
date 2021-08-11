const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// Cover image file을 uploading하기 위한 multer 모듈 적용
//const multer = require('multer');
const path = require('path');
//const fs = require('fs'); // file system
//const uploadPath = path.join('public', Book.coverImageBasePath); //path.join을 통해 public 폴더 내 'uploads/bookCovers'를 연결
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
/*
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
        //coverImageName: fileName, => multer모듈 삭제후, 제거
        description: req.body.description,
    }); 

    saveCover(book, req.body.cover); // FilePond적용후, coverImage를 저장하기 위한 함수
    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
        //res.redirect('books');
        console.log('req.file = ');
        console.log(req.file);
    } catch {

        /*if (book.coverImageName != null) {
            removeBookCover(book.coverImageName); // multer 모듈 대신에 File Encode 적용했기 때문에 불필요한 removeBookCover 함수제거
        }*/
        renderNewPage(res, book, true);
    }
});

/*
function removeBookCover(fileName) {
    // multer 모듈 대신에 File Encode 적용했기 때문에 불필요한 removeBookCover 함수제거
    // fs.unlink method is used to remove a file or symbolic link from the filesystem.
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err); // err would be thrown if the method fails
    });
}
*/

// Show Books : /Books 페이지에서 특정 book 클릭후, 획득된 book의 id를 통해 book의 상세 내용을 show
router.get('/:id', async (req, res) => {
    try {
        // populate : mongoDB의 Book 테이블의 author정보를 얻기 위해 Author 테이블 (name) 을 참조하기 위한 기능
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book: book});     
    } catch {
        res.redirect('/');
    }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        //const book = await Book.findById(req.params.id);
        const book = await Book.findById(req.params.id).populate('author').exec();
        console.log('Edit Book Route: book = ');
        console.log(book.coverImage);
        renderEditPage(res, book);
    } catch {
        res.redirect('/');
    }
});

// Update Book Route
router.put('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        console.log('Update Book Route: book.id =');
        console.log(book);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        //book.publishDate = req.body.publishDate;
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
        //res.redirect('/books');
    } catch (err) {
        console.log(err);

        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/');
        }
    }
});

// Delete Book
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch {
        if (book == null) {
            res.redirect('/');
        } else {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book',
            });
        }
    }
});

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        //console.log('renderFormPage:book =');
        //console.log(book);
        //console.log(authors);
        const params = {
            authors: authors,
            book: book,
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = "Error Updating Book";
            } else {
                params.errorMessage = "Error Editing Book";
            }
        }
        res.render(`books/${form}`, params); //Passing variables into new.ejs or edit.ejs (from views)
    } catch {
        res.redirect('/books'); ////error발생될때, localhost:3000/books 페이지로 redirect
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;

    const cover = JSON.parse(coverEncoded); // parsing JSON string into a single JSON
    if (cover !== null && imageMimeTypes.includes(cover.type)) { // File Encode의 JSON구조에서 "type"값이 이미지 type
        // cover.data를 직접 적용하는 것 대신에, cover.data를 Buffer로 전환해서 적용
        // Node.js의 Buffer : 데이터가 한장소에서 다른 장소로 이동하는 동안 임시로 저장하는 물리적 메모리 저장소
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    } 
}

module.exports = router;