const express = require('express')
const request = require('request')
const WebSocket = require('ws');
const app = express();

const clients = new Set();


app.get('/', (req, res) => {
    res.send("Yeah!!")
})


const server = app.listen(8000, () => {
    console.log("Server running")
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    clients.add(ws)

    ws.on('message', (message) => {
        console.log('Received message:', message);
        sendToAllClients(message);
        // Process the message as needed
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});


const sendToAllClients = (message) => {
    clients.forEach((client) => {
        client.send(message);
    });
};