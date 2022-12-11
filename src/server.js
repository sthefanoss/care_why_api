const express = require('express');

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs")
const app = express();
const port = 21070;
const fileStorage = require('./utils/file_storage');
const database = require('./utils/database');
const User = require('./models/user');
const Lup = require('./models/lup');
const Exchange = require('./models/exchange');
const jwt = require('jsonwebtoken');
const { json } = require('express/lib/response');

const url = 'http://carewhyapp.kinghost.net/';
const jwtSecret = '3ad5b1cbddc52a80a89a3e22fa3a9f49';

const verifyJWT = async (req, res, next) => {
  const token = req.headers['token'];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  
  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
    
    const user = await User.findOne({ where: { id: decoded.userId} });
    if (!user) return res.status(500).json({ message: 'Invalid token.' });
    
    req.user = user;
    next();
  });
};

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

/// Auth | Admin | Manager
/// Cria usuário
///
/// Regras
///  - username deve estar disponível
app.post('/admin/user', verifyJWT, async (req, res) => {
  //params
  let username = req.body.username.toLocaleLowerCase();
  // apply validations

  if(!req.user.isAdmin && !req.user.isManager) {
    return res.status(400).send('must be admin or manager');
  }

  if(!username) {
    return res.status(400).send('username is required');
  }

  const user = await User.findOne({ where: { username } });
  
  if(user) {
    return res.status(400).send('username already registered');
  }

  const newUser = User.build({ username });
  await newUser.save();
  res.send('ok');
})

/// Auth | Admin
/// Atualiza se usuário é gerente
///
/// Regras
///  - username deve estar disponível
app.post('/auth/set-manager', (req, res) => {
  //params
  let token = req.query.token;
  let username = req.query.username.toLocaleLowerCase();
  let isManager = req.query.isManager;
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
  if(!user) {
    return res.status(400).send('username not found');
  }

  if(user.isAdmin) {
    return res.status(400).send('user must not be admin admin');
  }

  user.isManager = isManager;
  res.send('ok');
})

/// Auth | Admin | Manager
/// Reseta senha de user
///
/// Regras
///  - username deve estar disponível
///  - senha deve existir
app.post('/auth/users-password', (req, res) => {
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

  if(!authUser.isAdmin || !authUser.isManager) {
    return res.status(400).send('must be admin or manager');
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

/// Auth | Admin | Manager
/// Deleta user
///
/// Regras
///  - não pode ter criado perfil
app.post('/auth/delete-user', (req, res) => {
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

  if(!authUser.isAdmin && !authUser.isManager) {
    return res.status(400).send('must be admin or manager');
  }

  let user = users.find(user => user.username == username);
  if(!user) {
    return res.status(400).send('username not found');
  }

  if(user.profileId) {
    return res.status(400).send('cant delete user with profile');
  }

  users = users.filter(u => u != user);
  res.send('ok');
}) 

/// Publica
/// Retorna token, recebe username e password
app.get('/login', async (req, res)  => {
  let username = req.body?.username?.toLocaleLowerCase();
  let password = req.body?.password;
  // apply validations
  if(!username || !password) {
    return res.status(400).send('username and password are required');
  }

  const user = await User.scope('withPassword').findOne({ where: { username } });

  if(!user) {
    return res.status(400).send('invalid credentials 1');
  }

  const hasMatch = await bcrypt.compare(password, user.password);
   
  if(!hasMatch) {
    return res.status(400).send('invalid credentials 2');
  }

  delete user.dataValues.password;
  const token = jwt.sign({ userId: user.id }, jwtSecret);
  res.json({token: token, user: user});
});

/// Pública
/// Cria credenciais
///
/// Regras
///  - username deve estar cadastrado
///  - senha deve ser nula
app.post('/signup', async (req, res) => {
  //params
  let username = req.body.username.toLocaleLowerCase();
  let password = req.body.password;
  // apply validations
  if(!username || !password) {
    return res.status(400).send('invalid data');
  }
  
  const user = await User.scope('withPassword').findOne({ where: { username } });
  if(!user) {
    return res.status(400).send('username not registered on our database');
  }

  if(user.password) {
    return res.status(400).send('username already registered');
  }
  
  user.password = await bcrypt.hash(password, 8);
  await user.save();
  delete user.dataValues.password;
  const token = jwt.sign({ userId: user.id }, jwtSecret);
  res.json({token: token, user: user});
})

/// Auth | Admin | Manager
/// Gasta moedas de usuário
///
/// Recebe amount e reason
/// Regras
///  - usuário que está fazendo a request deve ser admin ou manager
///  - usuario que esta sendo debitado deve ter as moedas
app.post('/auth/spent-coins', (req, res) => {
  //params
  let token = req.query.token;
  let reason = req.query.reason;
  let amount = req.query.amount;
  let username = req.query.username;
  // apply validations
  if(!reason) {
    return res.status(400).send('reason is required');
  }

  if(!token) {
    return res.status(400).send('invalid token');
  }

  let authUser = users.find(user => user.token == token);
  if(!authUser) {
    return res.status(400).send('invalid token');
  }

  if((!authUser.isAdmin && !authUser.isManager)) {
    return res.status(400).send('must be admin or manager');
  }

  if(!username) {
    return res.status(400).send('username is required');
  }
  
  let user = users.find(user => user.username == username);
  if(!user) {
    return res.status(400).send('username doesnt exist');
  }

  if(amount < 1 || amount > user.coins) {
    return res.status(400).send('invalid amount');
  }

  user.coins = user.coins - amount;
  exchanges.push({
    id: new Date().getTime(),
    reason,
    amount,
    username,
    authorizedBy: authUser.username,
  });
  res.send('ok');
})

/// Auth
/// Pega usuário por token
app.get('/exchanges', (req, res) => {
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

  if(authUser.profileId) {
    authUser.profile = profiles.find(p => p.id == authUser.profileId);
  }

  if(authUser.isManager || authUser.isAdmin) {
    return res.json(exchanges);
  }

  res.json(exchanges.filter(e => e.username == authUser.username));
})

/// Auth
/// Pega usuário por token
app.get('/user-data', verifyJWT, async (req, res) => {
  res.json({user: req.user});
})

/// Auth
/// Retorna lista de lups de todos os usuários
app.get('/lups', verifyJWT, async (req, res) => {
  const lups = await Lup.findAll();
  res.json(lups);
})

/// Auth
/// Retorna lista de usuários e seus perfis
app.get('/users', (req, res) => {
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

  users.forEach(u => {
    if(u.profileId) {
      u.profile = profiles.find(p => p.id == u.profileId);
    }
  });

  res.json(users);
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
app.post('/profile', verifyJWT, fileStorage.single('image'), async (req, res) => {
  //params
  let nickname = req.body.nickname;
  let file = req.file;
  // apply validations
  if(!nickname) {
    return res.status(400).send('nickname is required');
  }
  req.user.nickname = nickname;
  if(file) { req.user.imageUrl = url + file.path; }
  await req.user.save();

  res.json({user: req.user});
});

/// Auth
/// Cria lup
app.post('/lups', verifyJWT, fileStorage.single('image'), async (req, res) => {
    //params
    let file = req.file;
    let data = req.body; 
    // apply validations

  if(file == null) return res.status(400).send('image is required');
  if(data.title == null) return res.status(400).send('title is required');
  if(data.description == null) return res.status(400).send('description is required');
  // let collaboratorIds = [];
  // let collaborators = [];
  // if(data.collaboratorIds != null) {
  //   if(!Array.isArray(data.collaboratorIds)) return res.status(400).send('collaboratorIds must be an array');
  //   collaboratorIds = data.collaboratorIds;
  //   collaborators = collaboratorIds.map(findUserById);
  //   if(collaborators.some((c) => c == null)) return res.status(400).send('collaborator not found');
  // }

  // authUser.coins++;
  req.user.coins++;
  await req.user.save();
  const lup = Lup.build({
    authorId: req.user.id,
    title: data.title,
    description: data.description,
    imageUrl: url + file.path,
  }); 
  await lup.save();
  res.json(lup);
})

Lup.belongsTo(User, {foreignKey: 'authorId'});
Exchange.belongsTo(User, {foreignKey: 'buyerId'});
Exchange.belongsTo(User, {foreignKey: 'sellerId'});

database.sync({
  //force: true
}).then(() => {
  console.log('Connection has been established successfully.');
  app.listen(port, () => {
    console.log('Connection has been established successfully 2.');
  });	
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});							