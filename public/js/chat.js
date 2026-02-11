const socket = io();

const username = localStorage.getItem("user");
let currentRoom = "";

function joinRoom(){

 currentRoom = room.value;

 socket.emit('joinRoom',{
   username,
   room:currentRoom
 });

 loadOldMessages();
}

function leaveRoom(){
 socket.emit('leaveRoom',{
   username,
   room:currentRoom
 });

 chat.innerHTML="";
}

function sendMessage(){

 if(!currentRoom){
   alert("Join room first");
   return;
 }

 socket.emit('chatMessage',{
   from_user:username,
   room:currentRoom,
   message:msg.value
 });

 msg.value="";
}

msg.addEventListener('keypress',()=>{

 socket.emit('typing',{
   username,
   room:currentRoom
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


// Load old messages from Mongo
async function loadOldMessages(){

 const res = await fetch('/old/'+currentRoom);
 const data = await res.json();

 chat.innerHTML="";

 data.forEach(d=>{
   chat.innerHTML += `<p><b>${d.from_user}</b>: ${d.message}</p>`;
 });

}
