const express = require('express');
const multer = require("multer");
const bodyParser = require("body-parser");
const app = express();
const port = 21147;

const url = 'http://carewhyapp.kinghost.net/';

app.use("/public", express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + '.jpg');
  },
});

const upload = multer({
    storage: storage
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if(req.url == '/') {
    res.redirect('http://app.carewhyapp.kinghost.net/');
    return;s
  }
  if(req.url == '/pudim') {
    res.redirect('http://pudim.com.br/');
    return;
  }
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const users = [];

const lups = [];

const findUserById = (id) => {
  return users.find(user => user.id == id);
};

app.get('/lups', (req, res) => {
  res.json(lups.map( lup => { return {
    author: findUserById(lup.authorId),
    id: lup.id,
    title: lup.title,
    description: lup.description,
    collaborators: lup.collaboratorIds.map(findUserById)    
   };
  }));
})

app.get('/users', (req, res) => {
  let token = req.query.token;
  if(token == null) {
    res.json(users);
  } else {
    res.json(users.filter(user => user.id != token));
  }
})

app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  let user = findUserById(id);
  if(user == undefined) {
    res.status(400).send(`id not found ${users.length} ${id}`);
  }
  res.json(user);
})

app.post('/users', upload.single('image'), (req, res) => {
  let user = req.query;
  // apply validations
  let file = req.file;
  if(user.name == null) return res.status(400).send('name is required');
  if(file == null) return res.status(400).send('imageUri is required');
  
  let newUser = {
    id: new Date().getTime(),
    name: user.name,
    imageUrl: url + req.file.path,
  };

  users.push(newUser);
  res.json(newUser);
});

app.post('/lups', upload.single('image'), (req, res) => {
  let data = req.query; 
  let token = data.token;
  let file = req.file;
  console.log(file);
  let newLup = {
    authorId: token,
    id: new Date().getTime(),
    title: data.title,
    description: data.description,
    collaboratorIds: data.collaboratorIds || [],
    imageUrl: url + req.file.path,
  };
  lups.push(newLup);
  res.json({
    author: findUserById(newLup.authorId),
    id: newLup.id,
    title: newLup.title,
    description: newLup.description,
    collaborators: newLup.collaboratorIds.map(findUserById),
    imageUrl: newLup.imageUrl,
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})								