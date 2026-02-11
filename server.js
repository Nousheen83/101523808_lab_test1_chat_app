require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Mongo Atlas Connected"));


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
  const user = await User.findOne(req.body);

  if(user)
    res.json({username:user.username});
  else
    res.json({msg:"Invalid"});
});


// ===== SOCKET =====
io.on('connection', (socket)=>{

  socket.on('joinRoom', ({username, room})=>{
    socket.join(room);

    io.to(room).emit('message',{
      from_user:"system",
      message: username+" joined "+room
    });
  });


  socket.on('chatMessage', async (data)=>{

    await GroupMessage.create({
      ...data,
      date_sent: new Date().toLocaleString()
    });

    io.to(data.room).emit('message', data);
  });


  socket.on('typing', (data)=>{
    socket.broadcast
      .to(data.room)
      .emit('typing', data.username);
  });

});


server.listen(process.env.PORT);
