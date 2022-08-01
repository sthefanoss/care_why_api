const express = require('express');

const bodyParser = require("body-parser");
const app = express();
const port = 21147;
const jsonFileSystem = require('./utils/json_file_system');
const fileStorage = require('./utils/file_storage');

const url = 'http://carewhyapp.kinghost.net/';

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/upload", express.static(__dirname + "/upload"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if(req.url == '/') {
    res.redirect('http://app.carewhyapp.kinghost.net/');
    return;
  }
  next();
});

let users = [];

let lups = [];

const findUserById = (id) => {
  return users.find(user => user.id == id);
};

app.get('/lups', (req, res) => {
  res.json(lups.map( lup => {
    return {
      id: lup.id,
      description: lup.description,
      title: lup.title,
      author: findUserById(lup.authorId),
      collaborators: lup.collaboratorIds.map(findUserById),
      imageUrl: lup.imageUrl,
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

app.post('/users', fileStorage.single('image'), (req, res) => {
  let user = req.query;
  let file = req.file;
  // apply validations
  if(!user.name) return res.status(400).send('name is required');
  if(file == null) return res.status(400).send('image is required');
  
  let newUser = {
    id: new Date().getTime(),
    name: user.name,
    imageUrl: url + req.file.path,
  };

  users.push(newUser);
  jsonFileSystem.save('database/users.txt',users, (err) => {
    res.json(newUser);
    if(err) console.log(err);
  });
});

app.post('/lups', fileStorage.single('image'), (req, res) => {
  let data = req.query; 
  let token = data.token;
  let file = req.file;
  if(token == null) return res.status(400).send('token is required');
  let author =  findUserById(token);
  if(author == null) return res.status(400).send('user not found for given token');
  if(file == null) return res.status(400).send('image is required');
  if(!data.title) return res.status(400).send('title is required');
  if(!data.description) return res.status(400).send('description is required');
  let collaboratorIds = [];
  let collaborators = [];
  if(data.collaboratorIds != null) {
    if(!Array.isArray(data.collaboratorIds)) return res.status(400).send('collaboratorIds must be an array');
    collaboratorIds = data.collaboratorIds;
    collaborators = collaboratorIds.map(findUserById);
    if(collaborators.some((c) => c == null)) return res.status(400).send('collaborator not found');
  }
  
  let newLup = {
    authorId: token,
    id: new Date().getTime(),
    title: data.title,
    description: data.description,
    collaboratorIds,
    imageUrl: url + file.path,
  };
  lups.push(newLup);
  jsonFileSystem.save('database/lups.txt', lups, () => {
    res.json({
      author,
      id: newLup.id,
      title: newLup.title,
      description: newLup.description,
      collaborators,
      imageUrl: newLup.imageUrl,
    });
  });
})

app.listen(port, () => {
  jsonFileSystem.load("database/lups.txt", (err, data) => {
    if(data) {
      lups = data;
    }
    jsonFileSystem.load("database/users.txt", (err, data) => {
      if(data) {
        users = data;
      }
      console.log(`Example app listening on port ${port}`)
    })
  });
})								