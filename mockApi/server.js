import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';

import {DEFAULT_HTTP_STATUS_MSG_HASH} from 'src/helpers/ApiErrorCode';
import { getDomainConfig } from '../build.settings';
// import multer from 'multer';

// routes
import todos from './routes/todos';
import model from './routes/models';
// import accounts from './routes/accounts';
// import auth from './routes/auth';

const {DATA_NOT_FOUND} = DEFAULT_HTTP_STATUS_MSG_HASH;

const CONTENT_TYPE_ARY = [
  'text/html',
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

// const upload = multer();
const config = getDomainConfig();
const app = express();

app.use(cors());

// API Server
app.use(session({
  secret: 'react and redux rule!!!!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000,
  },
}));

// upload file
// app.post('/trader/desktop/strategy/upload', upload.any(), (req, res, next) => {
//   next();
// });

app.use((req, res, next) => {

  if (req.headers['content-type']) {

    // client 傳來 content-type 後面多一個;, 會導致 bodyParser 無法處理
    const contentTypeAry = req.headers['content-type'].replace(';', '').split(' ');

    if (CONTENT_TYPE_ARY.indexOf(contentTypeAry[0]) !== -1) {
      req.headers['content-type'] = contentTypeAry[0];
    } else {
      console.error('==> ERROR: content-type is not supported!!');
    }
  }

  next();
});

app.use(bodyParser.json({
  limit: '200mb',
}));

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '200mb',
  parameterLimit: 100000,
}));

app.use('/trader/desktop/todos', todos);
// app.use('/trader/desktop/accounts', accounts);
// app.use('/trader/desktop/auth', auth);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(DATA_NOT_FOUND.status).json(DATA_NOT_FOUND);
});

app.listen(config.__MOCK_API_PORT__, (err) => {
  if (err) {
    console.error(err);
  }
  console.info('==> 🌎 Mock API is running on port %s', config.__MOCK_API_PORT__);
});

if (!config.__MOCK_API_PORT__) {
  console.error('==> ERROR: No mockApiPort environment variable has been specified');
}
