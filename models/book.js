// Mongoose는 Node.js와 MongoDB를 연결하는 ODM (object document mapping)
// SQL에서의 table 개념 대신에, Mongoose는 Schema를 통해서 Table처럼 데이터 정리
// MVP에서 Model에 해당
const mongoose = require('mongoose');
const path = require('path');
const coverImageBasePath = 'uploads/bookCovers'; // Cover image file이 저장되는 경로 설정. 즉, public폴더내 'uploads/bookCovers"

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    createdAt: { // 책을 database에 등록한 날짜
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: { 
        // passing in the image itself into the database. So just pass the name of the image
        // We can just store a single small string and then we can store the actual image itself on our server in the file system
        type: String,
        required: true,
    },
    author: { // mongoose에 이미 저장된 author 정보로 부터 가져오는 정보
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author' // mongoose에 저장된 Author table으로 부터 referencing
    }
});

// Virtual is document property that you can get and set but that does not get persisted to MongoDB
bookSchema.virtual('coverImagePath').get(function() {
    // this를 사용하기 위해서 arrow function 대신에 function() 적용
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName);
    }
});


module.exports = mongoose.model('Book', bookSchema); //생성된 Schema (=Table)의 명칭을 Book으로 설정
module.exports.coverImageBasePath = coverImageBasePath; //// Cover image file이 저장되는 경로를 export