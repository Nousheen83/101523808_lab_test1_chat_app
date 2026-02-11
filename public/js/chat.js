const socket = io();

const username = localStorage.getItem("user");

function joinRoom(){
  socket.emit('joinRoom',{
    username:username,
    room:room.value
  });
}

function sendMessage(){

  socket.emit('chatMessage',{
    from_user:username,
    room:room.value,
    message:msg.value
  });

  msg.value="";
}

msg.addEventListener('keypress',()=>{

 socket.emit('typing',{
   username:username,
   room:room.value
 });

});

socket.on('message', d=>{
 chat.innerHTML += `<p><b>${d.from_user}</b>: ${d.message}</p>`;
});

socket.on('typing', u=>{
 typing.innerHTML = u+" is typing...";
 setTimeout(()=>typing.innerHTML="",1000);
});

function logout(){
 localStorage.clear();
 location="login.html";
}
