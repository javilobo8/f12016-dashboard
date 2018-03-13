const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');
const dgram = require('dgram');

const structure = require('./structure');

const UDP_PORT = 20776;
const UDP_HOST = 'localhost';
const HTTP_PORT = 1337;

const GEARS = ['R', 'N', '1', '2', '3', '4', '5', '6', '7', '8'];
const f1socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

function createDataStructure(message) {
  const data = {};
  Object.keys(structure).forEach((key, index) => {
    data[key] = message.readFloatLE(index * 4);
  });
  //console.log(data);
  return data;
}

const clients = {};
io.on('connection', function (socket) {
  clients[socket.id] = socket;
  console.log('Client connected!')

  f1socket.on('message', function (message, remote) {
    const data = createDataStructure(message);
    socket.emit('data', data);
  });

  socket.on('disconnect', function() {
    delete clients[socket.id];
  });
});

f1socket.bind(UDP_PORT, UDP_HOST, () => {
  console.log(`Socket bound on ${UDP_HOST}:${UDP_PORT}!`);
});

app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}!`);
});

