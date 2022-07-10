const express = require('express');
//const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const port = 21147;

//app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get('/lups', (req, res) => {
  res.json(lups.map( lup => { return {
    author: users.find(user => user.id == lup.authorId),
    id: lup.id,
    title: lup.title,
    description: lup.description,
    collaborators: lup.collaboratorIds.map(id => users.find(user => user.id == id))    
   };
  }));
})

app.get('/users', (req, res) => {
  let data = req.query; 
  let token = data.token;
  if(token == null) {
    res.json(users);
  }
  res.json(users.filter(user => user.id != token));
})

app.get('/users/:id', (req, res) => {
  let id = req.params.id;
  let user = users.find(e => e.id == id);
  if(user == undefined) {
    res.status(400).send(`id not found ${users.length} ${id}`);
  }
  res.json(user);
})

app.post('/users', (req, res) => {
  let user = req.query;
  // apply validations
  if(user.name == null) return res.status(400).send('name is required');
  if(user.imageUri == null) return res.status(400).send('imageUri is required');
  
  let newUser = {
    id: new Date().getTime(),
    name: user.name,
    imageUri: user.imageUri,
  };

  users.push(newUser);
  res.json(newUser);
});

app.post('/lups', (req, res) => {
  let data = req.query; 
  let token = data.token;
  if(data.title == null) return res.status(400).send('title is required');
  if(data.description == null) return res.status(400).send('description is required');
  
  let newLup = {
    authorId: token,
    id: new Date().getTime(),
    title: data.title,
    description: data.description,
    collaboratorIds: data.collaboratorIds || []
  };
  
  lups.push(newLup);
  res.json({
    author: users.find(user => user.id == token),
    id: newLup.id,
    title: newLup.title,
    description: newLup.description,
    collaborators: newLup.collaboratorIds.map(id => { return users.find(user => user.id == id);})
  });
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})								