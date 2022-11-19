const express = require('express');
const webSocket = require('ws');
const path = require('path');
const uuid = require('uuid');
var app = express();
const WS_PORT = 8888;
//Start Web API
var server = app.listen(process.env.PORT || 80, () =>{
    var host = server.address().address
    var port = server.address().port
    console.log("ESP32 Cam Router listening at http://%s:%s", host, port)
});

var wsServer = new webSocket.Server({ port: WS_PORT },()=>{
    console.log(`Web Socket Listening at ${WS_PORT}`);
});
const connectedClients = new Map();
const clientTimeout = new Map();

wsServer.on(`connection`, (ws, req, client)=>{
    console.log(`Connection Url ${req.url}`);
    let id = req.url.substring(1) === "" ? uuid.v4():req.url.substring(1);
    console.log(`Connected to ${id}`);
    addValueToKey(id,ws)
    ws.on('message', data =>{
        if (data == '__pong__') {
            //TODO add ping/pong/heartbeat to remove dead connections
            return;
        }
        connectedClients[id].forEach((ws,i)=>{
            if(ws.readyState === ws.OPEN){
                ws.send(data);
            }else{
                connectedClients[id].splice(i,1);
            }
        });
    });
});

app.get(`/client`,(req,res)=>{
    res.sendFile(path.resolve(__dirname, './client.html'));
});

function addValueToKey(key, value) {
    // Shorcut || returns left side if it is "truthy," or the right otherwise.
    // This means that we only assign a new Array to the Object's property
    // if it has not previously been used.
    connectedClients[key] = connectedClients[key] || [];
    // Adds a value to the end of the Array
    connectedClients[key].push(value);
}
