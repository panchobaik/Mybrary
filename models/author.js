// Mongoose는 Node.js와 MongoDB를 연결하는 ODM (object document mapping)
// SQL에서의 table 개념 대신에, Mongoose는 Schema를 통해서 Table처럼 데이터 정리
const mongoose = require('mongoose');
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, //required:true를 통해, name은 반드시 필요한 값으로 지정
    }
});

module.exports = mongoose.model('Author', authorSchema); // 생성된 Schema (=Table)의 명칭을 Author로 설정