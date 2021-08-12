
// Mongoose는 Node.js와 MongoDB를 연결하는 ODM (object document mapping)
// SQL에서의 table 개념 대신에, Mongoose는 Schema를 통해서 Table처럼 데이터 정리
// MVP에서 Model에 해당
const mongoose = require('mongoose');
const Book = require('./book');
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, //required:true를 통해, name은 반드시 필요한 값으로 지정
    }
});


// 책 등록에 이미 적용된 author name을 잘못 delete되는 문제를 보호하는 설정
// "pre" allows us to run a method before a certain action (=remove) occurs
authorSchema.pre('remove', function(next) {
    Book.find({author: this.id}, (err, books) => {
        if (err) {
            next(err);
        } else if (books.length > 0) {
            next( new Error('This author has books still'));
        } else {
            next();
        }
    });
});

// 책 등록에 이미 적용된 author name을 edit과정에서 새로운 이름으로 update되는 문제를 보호하는 설정
// 하지만, 이미 등록된 책 정보에 author.id를 통해 author.name이 update하기 때문에 이런 보호 설정 불필요
/*
authorSchema.pre('save', function(next) {
    Book.find({author: this.id}, (err, books) => {
        if (err) {
            next(err);
        } else if (books.length > 0) {
            next ( new Error('This author has books still'));
        } else {
            next();
        }
    });
});
*/

module.exports = mongoose.model('Author', authorSchema); // 생성된 Schema (=Table)의 명칭을 Author로 설정