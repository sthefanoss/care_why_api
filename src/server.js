const express = require('express');

const bodyParser = require("body-parser");
const app = express();
const port = 21147;
const jsonFileSystem = require('./utils/json_file_system');
const fileStorage = require('./utils/file_storage');

const url = 'http://carewhyapp.kinghost.net/';

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use("/upload", express.static("upload"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if(req.url == '/') {
    res.redirect('http://app.carewhyapp.kinghost.net/');
    return;
  }
  next();
});

let users = [{id:0, 
  username: 'admin', 
  password:'Fooboobar',
  token: '43243251fdsf214',
  isAdmin: true,
  profileId: null}];

let lups = [];

let profiles = [];

const findUserById = (id) => {
  return users.find(user => user.id == id);
};

/// Auth | Admin
/// Cria usuário
///
/// Regras
///  - username deve estar disponível
app.post('/auth/user', (req, res) => {
  //params
  let token = req.query.token;
  let username = req.query.username;
  // apply validations
  if(!token) {
    return res.status(400).send('invalid token');
  }

  let authUser = users.find(user => user.token == token);
  if(!authUser) {
    return res.status(400).send('invalid token');
  }

  if(!authUser.isAdmin) {
    return res.status(400).send('must be admin');
  }

  if(!username) {
    return res.status(400).send('username is required');
  }
  
  let user = users.find(user => user.username == username);
  if(user) {
    return res.status(400).send('username already registered');
  }

  users.push({
    id: new Date().getTime(),
    username: username,
    isAdmin: false,
    password: null,
    profileId: null,
  });

  res.send('ok');
})

/// Auth | Admin
/// Lista usuários
app.get('/auth/users', (req, res) => {
  // apply validations
  if(!token) {
    return res.status(400).send('invalid token');
  }

  let authUser = users.find(user => user.token == token);
  if(!authUser) {
    return res.status(400).send('invalid token');
  }

  if(!authUser.isAdmin) {
    return res.status(400).send('must be admin');
  }

  res.json(users);
})

/// Auth | Admin
/// Reseta senha de user
///
/// Regras
///  - username deve estar disponível
///  - senha deve existir
app.get('/auth/users', (req, res) => {
  //params
  let token = req.query.token;
  let username = req.query.username;
  // apply validations
  if(!token) {
    return res.status(400).send('invalid token');
  }

  let authUser = users.find(user => user.token == token);
  if(!authUser) {
    return res.status(400).send('invalid token');
  }

  if(!authUser.isAdmin) {
    return res.status(400).send('must be admin');
  }

  let user = users.find(user => user.username == username);
  if(!user) {
    return res.status(400).send('username not registered on our database');
  }

  if(!user.password) {
    return res.status(400).send('password already reseted');
  }

  user.password = null;
  res.send('ok');
})

/// Publica
/// Retorna token, recebe username e password
app.get('/login', (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  // apply validations
  if(!username || !password) {
    return res.status(400).send('invalid credentials');
  }
  
  let user = users.find(user => user.username == password && user.password == password);
  if(!user) {
    return res.status(400).send('invalid credentials');
  }

  res.json({token: user.token, user: user});
})

/// Pública
/// Cria credenciais
///
/// Regras
///  - username deve estar cadastrado
///  - senha deve ser nula
app.post('/signup', (req, res) => {
  //params
  let username = req.query.username;
  let password = req.query.password;
  // apply validations
  if(username == null || password  == null) {
    return res.status(400).send('invalid data');
  }
  
  let user = users.find(user => user.username == username);
  if(!user) {
    return res.status(400).send('username not registered on our database');
  }

  if(user.password) {
    return res.status(400).send('username already registered');
  }
  
  user.token = new Date().getTime();
  user.password = password;

  res.json({token: user.token, user: user});
})

/// Auth
/// Pega usuário por token
app.post('/user', (req, res) => {
    //params
    let token = req.query.token;
    // apply validations
    if(!token) {
      return res.status(400).send('invalid token');
    }
  
    let authUser = users.find(user => user.token == token);
    if(!authUser) {
      return res.status(400).send('invalid token');
    }

  res.json(authUser);
})

/// Auth
/// Retorna lista de lups de todos os usuários
app.get('/lups', (req, res) => {
  //params
  let token = req.query.token;
  // apply validations
  if(!token) {
    return res.status(400).send('invalid token');
  }

  let authUser = users.find(user => user.token == token);
  if(!authUser) {
    return res.status(400).send('invalid token');
  }

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

/// Auth
/// Retorna lista de usuários e seus perfis
app.get('/users', (req, res) => {
  let token = req.query.token;
  if(token == null) {
    res.json(users);
  } else {
    res.json(users.filter(user => user.id != token));
  }
})

/// Auth
/// retorna perfil
app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  let user = findUserById(id);
  if(user == undefined) {
    res.status(400).send(`id not found ${users.length} ${id}`);
  }
  res.json(user);
})

/// Auth
/// Cria/Edita perfil
app.post('/users', fileStorage.single('image'), (req, res) => {
  //params
  let user = req.query;
  let file = req.file;
  // apply validations
  if(user.name == null) return res.status(400).send('name is required');
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

/// Auth
/// Cria lup
app.post('/lups', fileStorage.single('image'), (req, res) => {
  let data = req.query; 
  let token = data.token;
  let file = req.file;
  if(token == null) return res.status(400).send('token is required');
  let author =  findUserById(token);
  if(author == null) return res.status(400).send('user not found for given token');
  if(file == null) return res.status(400).send('image is required');
  if(data.title == null) return res.status(400).send('title is required');
  if(data.description == null) return res.status(400).send('description is required');
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