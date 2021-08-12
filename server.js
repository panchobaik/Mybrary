
if (process.env.NODE_ENV !== 'production') {
    //console.log("I am here");
    require('dotenv').config(); 
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
//const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const port = 3000;

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

app.set('view engine', 'ejs'); //view engine을 ejs로 설정
app.set('views', __dirname + '/views'); // views을 가져올 폴더 설정 (body에 해당하는 파일들 배치)
app.set('layout', 'layouts/layout'); //layout에 적용할 폴더 설정 (header와 footer 정보) 

app.use(expressLayouts);
app.use(methodOverride('_method')); // "_"를 붙혀서 잘 사용되지 않는 이름으로 만들어서 혼동없이 put 또는 delete 실행
app.use(express.static('public')); // public폴더에 모든 public views들을 배치

app.use(express.urlencoded({
    limit: '10mb',
    extended: false,
}));

/*
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: false,
})); */


const mongoose = require('mongoose'); // Mongoose는 Node.js와 MongoDB를 연결하는 ODM (object document mapping)
console.log(process.env.DATABASE_URL);
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));


app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

//특정 port 번호에 listing 성공하면 해당 callback함수 실행
app.listen(process.env.PORT || port, () => {
    console.log(`Server is starting with port : ${port}`);
});
