const express = require("express");
const request = require("request");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();

const clients = new Set();

app.get("/stream", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = path.join(__dirname, "files/videos/video.mp4");

  console.log(videoPath);

  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6;

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.use(express.static(path.join(__dirname, "client")));

// Catchall route to serve the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const state = {
  playbackToggle: false,
  updatePlaybackDuration: 0,
};

const server = app.listen(8000, () => {
  console.log("Server running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  clients.add(ws);

  //ws.send(JSON.stringify({type:"event", payload: state}))

  ws.on("message", async (event) => {
    // Process the message as needed

    handleMessage(event.toString());
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

wss.on("error", (err) => console.log(err));

const sendToAllClients = (message) => {
  clients.forEach((client) => {
    client.send(message);
  });
};

const handleMessage = (passedMessage) => {
  try {
    let message = JSON.parse(passedMessage);

    console.log(message);

    if (message.hasOwnProperty("chat")) {
      sendToAllClients(passedMessage);
    } else if (message.hasOwnProperty("event")) {
      let payload = {
        ...message,
      };

      if (payload.event == "updatePlaybackDuration") {
        //state.updatePlaybackDuration < payload.data ? state.updatePlaybackDuration = payload.data : null;
      }

      if (payload.event == "seek") {
        state.updatePlaybackDuration = payload.data;

        //sendToAllClients(JSON.stringify({type:"event", payload: {"updatePlaybackDuration": message.data}}))
      } else if (payload.event == "playbackToggle") {
        state.playbackToggle = payload.data;
        sendToAllClients(
          JSON.stringify({
            event: "",
            payload: { togglePlayback: message.data },
          })
        );
      }

      //sendToAllClients({type:"event", payload: state})
    } else if (message.hasOwnProperty("seek")) {
      let chat = {
        chat: "",
        payload: {
          name: "",
          text: "",
        },
      };

      chat.payload.name = "";
      chat.payload.text = `${
        message.initiator
      } seeked the video to ${convertSecondsToHMS(message.seek.toFixed(1))}`;

      sendToAllClients(JSON.stringify(chat));
      sendToAllClients(JSON.stringify(message));
    }
  } catch (err) {
    console.log(err);
  }
};

const convertSecondsToHMS = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);

  return (
    hours + " hours, " + minutes + " minutes, " + remainingSeconds + " seconds"
  );
};

//Schema

// message = {

//     type: ["event","connect","chat"],
//     payload: {}
// }

// state = {
//     playbackToggle: [true, false],
//     updatePlaybackDuration: "",
// }
