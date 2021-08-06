
if (process.env.NODE_ENV !== 'production') {
    console.log("I am here");
    require('dotenv').config(); 
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const port = 3000;

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs'); //view engine을 ejs로 설정
app.set('views', __dirname + '/views'); // views을 가져올 폴더 설정 (body에 해당하는 파일들 배치)
app.set('layout', 'layouts/layout'); //layout에 적용할 폴더 설정 (header와 footer 정보) 
app.use(expressLayouts);
app.use(express.static('public')); // public폴더에 모든 public views들을 배치


const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));


app.use('/', indexRouter);

//특정 port 번호에 listing 성공하면 해당 callback함수 실행
app.listen(process.env.PORT || port, () => {
    console.log(`Server is starting with port : ${port}`);
});
