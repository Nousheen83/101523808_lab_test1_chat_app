require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cors());

// static files
app.use(express.static(__dirname));   // to access /view pages
app.use(express.static('public'));    // css/js

// ===== MONGO CONNECTION =====
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Mongo Atlas Connected"))
.catch(err=>console.log(err));


// ==================================
// AUTH ROUTES
// ==================================

// ===== SIGNUP =====
app.post('/signup', async (req,res)=>{
  try{

    const user = new User({
      ...req.body,
      createon: new Date().toLocaleString()
    });

    await user.save();

    res.json({msg:"Signup Success"});
  }
  catch(err){
    res.json({msg:"Username already exists"});
  }
});


// ===== LOGIN =====
app.post('/login', async (req,res)=>{

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });

  if(user)
    res.json({username:user.username});
  else
    res.json({msg:"Invalid"});
});


// ==================================
// MESSAGE ROUTES
// ==================================

// ===== Load old GROUP messages =====
app.get('/old/:room', async (req,res)=>{

 const data = await GroupMessage.find({
   room:req.params.room
 });

 res.json(data);
});


// ===== Load PRIVATE messages =====
app.get('/private/:user', async (req,res)=>{

 const u = req.params.user;

 const data = await PrivateMessage.find({
   $or:[
     {from_user:u},
     {to_user:u}
   ]
 });

 res.json(data);
});


// ==================================
// SOCKET LOGIC
// ==================================

io.on('connection', (socket)=>{


  // ----- JOIN ROOM -----
  socket.on('joinRoom', ({username, room})=>{

    socket.join(room);

    io.to(room).emit('message',{
      from_user:"system",
      message: username+" joined "+room
    });

  });


  // ----- LEAVE ROOM -----
  socket.on('leaveRoom',({username,room})=>{

    socket.leave(room);

    io.to(room).emit('message',{
        from_user:"system",
        message: username+" left room"
    });

  });


  // ----- GROUP CHAT -----
  socket.on('chatMessage', async (data)=>{

    await GroupMessage.create({
      ...data,
      date_sent: new Date().toLocaleString()
    });

    io.to(data.room).emit('message', data);
  });


  // ----- TYPING INDICATOR -----
  socket.on('typing', (data)=>{

    socket.broadcast
      .to(data.room)
      .emit('typing', data.username);

  });


  // ----- PRIVATE CHAT -----
  socket.on('privateMessage', async (data)=>{

    await PrivateMessage.create({
      ...data,
      date_sent: new Date().toLocaleString()
    });

    io.emit('privateMessage', data);

  });


}); // socket end



// ===== SERVER START =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
  console.log("Server running on port " + PORT);
});
