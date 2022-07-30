const express = require('express');
const multer = require("multer");
const bodyParser = require("body-parser");
const fileSystem = require('fs');
const app = express();
const port = 21147;


const saveJson = (path, json, callback) => {
  fileSystem.writeFile(path, JSON.stringify(json), callback);
};

const loadJson = (path, callback) => {
  fileSystem.readFile(path, (err, data) => {
    if(err) {
      callback(err,null);
    }
    else {
      callback(null, JSON.parse(data));
    }
  });
};

const url = 'http://carewhyapp.kinghost.net/';

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/upload", express.static(__dirname + "/upload"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/');
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
  saveJson('database/users.txt',users, (err) => {
    res.json(newUser);
    if(err) console.log(err);
  });
});

app.post('/lups', upload.single('image'), (req, res) => {
  let data = req.query; 
  let token = data.token;
  let file = req.file;
  let newLup = {
    authorId: token,
    id: new Date().getTime(),
    title: data.title,
    description: data.description,
    collaboratorIds: data.collaboratorIds || [],
    imageUrl: url + file.path,
  };
  lups.push(newLup);
  saveJson('database/lups.txt', lups, () => {
    res.json({
      author: findUserById(newLup.authorId),
      id: newLup.id,
      title: newLup.title,
      description: newLup.description,
      collaborators: newLup.collaboratorIds.map(findUserById),
      imageUrl: newLup.imageUrl,
    });
  });
})

app.listen(port, () => {
  loadJson("database/lups.txt", (err, data) => {
    if(data) {
      lups = data;
    }
    loadJson("database/users.txt", (err, data) => {
      if(data) {
        users = data;
      }
      console.log(`Example app listening on port ${port}`)
    })
  });
})								