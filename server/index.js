const express = require('express');
const request = require('request')
const WebSocket = require('ws');


const app = express();

const clients = new Set();

app.use(express.static('client'));

const state = {
    playbackToggle : false,
    updatePlaybackDuration: 0,
}


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

    ws.send(JSON.stringify({type:"event", payload: state}))

    ws.on('message', async (event) => {       
        // Process the message as needed
        
        handleMessage(event.toString());
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

const handleMessage = (passedMessage) => {

    let message = JSON.parse(passedMessage);

    console.log(message)
    
    if(message.hasOwnProperty("chat"))
    {
        sendToAllClients(passedMessage);
    }
    else if (message.hasOwnProperty("event"))
    {
        let payload = {
            ...message
        }

        if(payload.event == "updatePlaybackDuration")
        {
            state.updatePlaybackDuration < payload.data ? state.updatePlaybackDuration = payload.data : null;
        }

        if(payload.event == "seek")
        {
            state.updatePlaybackDuration = payload.data

            sendToAllClients(JSON.stringify({type:"event", payload: {"updatePlaybackDuration": message.data}}))
        }

        else if(payload.event == "playbackToggle")
        {
            state.playbackToggle = payload.playbackToggle
        }

       //sendToAllClients({type:"event", payload: state})


    }

    

}


//Schema

// message = {

//     type: ["event","connect","chat"],
//     payload: {}
// }


// state = {
//     playbackToggle: [true, false],
//     updatePlaybackDuration: "",
// }

