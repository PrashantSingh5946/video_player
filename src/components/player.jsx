import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactComponent as WidescreenLogo } from "./svg/widescreen.svg";
import { ReactComponent as SettingsLogo } from "./svg/settings.svg";
import { ReactComponent as Play } from "./svg/play.svg";
import { ReactComponent as Pause } from "./svg/pause.svg";
import { ReactComponent as Next } from "./svg/next.svg";
import { ReactComponent as VolumeOn } from "./svg/volume_on.svg";
import { ReactComponent as Mute } from "./svg/mute.svg";

import {
  faPlay,
  faForwardStep,
  faVolumeHigh,
  faPause,
  faVolumeMute,
  faRotateRight,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./styles.module.css";

export default function Player(props) {
  const videoRef = useRef();
  const [isVideoPlaying, setVideoPlaying] = useState(null);
  const playButtonRef = useRef();
  const [passedDuration, setPassedDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bufferedDuration, setBufferedDuration] = useState(0);
  const [soundStatus, setSoundStatus] = useState(true);
  const [isVideoOver, setIsVideoOver] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [socketStatus, setSocketStatus] = useState(false);

  //Video dimensions
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setVideoHeight(height);
        setVideoWidth(width);
      }
    });

    if (videoRef.current) {
      resizeObserver.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        resizeObserver.unobserve(videoRef.current);
      }
    };
  }, []);

  //Chat data

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  function formatTime(seconds) {
    return [
      parseInt((seconds / 3600) % 3600),
      parseInt((seconds / 60) % 60),
      parseInt(seconds % 60),
    ]
      .join(":")
      .replace(/\b(\d)\b/g, "0$1");
  }

  function dispatcher(event) {
    console.log(event);

    // if(event=="updatePlaybackDuration")
    // {
    //   emitSocketMessage({ "event": event, data: passedDuration });

    console.log("Data dispatched");
    console.log(passedDuration);
    // }

    if (event == "playbackToggle") {
      emitSocketMessage({ event: event, data: !isVideoPlaying });
    }

    //functionMap[event]();
  }

  const emitSocketMessage = (message) => {
    if (socketStatus) {
      let packet = JSON.stringify(message);
      window.ws.send(packet);
    }
  };

  const fullscreenchanged = (event) => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
    }
  };

  //manage fullscreen listener
  useEffect(() => {
    //window.user = prompt("Please enter your name")

    document.onfullscreenchange = fullscreenchanged;

    console.log(process.env);
    let ws = new WebSocket(
      window.location.protocol == "http:"
        ? `ws://${window.location.hostname}:8000`
        : `wss://${window.location.host}`
    );
    window.ws = ws;
    ws.addEventListener("open", () => {
      setSocketStatus(true);
      console.log("Socket open");
    });

    ws.addEventListener("close", () => {
      setSocketStatus(false);
      console.log("Socket closed");
    });

    ws.addEventListener("error", (err) => {
      console.log(err);
    });

    ws.addEventListener("message", (packet) => {
      console.log("Server sent");

      console.log(packet.data);

      let message = JSON.parse(packet.data);

      //if(message.hasOwnProperty("chat"))

      if (message.hasOwnProperty("chat")) {
        setMessages((messages) => [message, ...messages]);
      } else if (message.hasOwnProperty("event")) {
        let payload = {
          ...message.payload,
        };

        for (let key in payload) {
          if (payload.hasOwnProperty(key)) {
            let func = functionMap[key];
            func(payload[key]);

            //console.log("Invoking function " + message["event"])
          }
        }

        //console.log("Server sent")
        //console.log(message)
      }
    });
  }, []);

  const functionMap = {
    togglePlayback: (prop) => {
      //console.log("Function has been called")
      //play and pause functionality
      console.log(prop);
      setVideoPlaying(prop);
    },

    updatePlaybackDuration: (target) => {
      // console.log("Duration changed")
      //console.log(target)
      //setPassedDuration(target);
    },

    // "seek": (target) =>
    // {
    //     console.log("Duration changed")
    //     setPassedDuration(target);
    // }
  };

  //replay functionality
  const replay = async () => {
    //console.log("Video playing");
    setIsVideoOver(false);
    setTimeout(() => {
      videoRef.current.play();
      setVideoPlaying(true);
    }, 500);
  };

  //handle play pause
  useEffect(() => {
    if (isVideoPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isVideoPlaying]);

  //move time left and write
  const moveBack = () => {
    if (videoRef.current.currentTime > 5) {
      videoRef.current.currentTime = videoRef.current.currentTime - 5;
    } else {
      videoRef.current.currentTime = 0;
    }
  };

  const moveForward = () => {
    if (videoRef.current.currentTime + 5 < videoRef.current.duration) {
      videoRef.current.currentTime = videoRef.current.currentTime + 5;
    } else {
      videoRef.current.currentTime = videoRef.current.duration;
    }
  };

  //update time on play
  const setTotalTime = () => {
    setTotalDuration(videoRef.current.duration);
  };

  //handle buffer length
  const setBufferedLength = () => {
    let bufferTimeRanges = videoRef.current.buffered;
    for (let i = 0; i < bufferTimeRanges.length; i++) {
      if (
        passedDuration >= bufferTimeRanges.start(i) &&
        passedDuration < bufferTimeRanges.end(i)
      ) {
        setBufferedDuration(bufferTimeRanges.end(i) - passedDuration);
      }
    }
  };

  //setting the buffer state and checking for repeat logo
  useEffect(() => {
    setBufferedLength();
    handleVideoOver();
  }, [passedDuration]);

  const jumpToTime = (e) => {
    if (isVideoOver) {
      setIsVideoOver(false);
      setVideoPlaying(false);
    }
    let clickpoint = e.clientX - 5;
    let equivalentDuration = (clickpoint / videoWidth) * totalDuration;
    videoRef.current.currentTime = equivalentDuration;
  };

  useEffect(() => {
    videoRef.current.muted = !soundStatus;
  }, [soundStatus]);

  const toggleSound = () => {
    setSoundStatus(!soundStatus);
  };

  const handleVideoOver = () => {
    if (passedDuration === totalDuration && passedDuration) {
      setIsVideoOver(true);
    }
  };

  // useEffect(() => {

  //   if (isFullScreen) {
  //     document.documentElement.requestFullscreen();
  //     var r = document.querySelector(":root");
  //     // Set the value of variable --blue to another value (in this case "lightblue")
  //     r.style.setProperty("--video-height", window.screen.height);
  //     r.style.setProperty("--video-width", window.screen.width);
  //   } else if (totalDuration) {
  //     var r = document.querySelector(":root");
  //     // Set the value of variable --blue to another value (in this case "lightblue")
  //     r.style.setProperty("--video-height", "510px");
  //     r.style.setProperty("--video-width", "860px");
  //     if (document.fullscreenElement) {
  //       document.exitFullscreen();
  //     }
  //   }
  // }, [isFullScreen]);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleWideScreen = () => {};

  const handleKeypress = (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      //alert("Hello")

      emitSocketMessage({
        chat: "",
        payload: { name: localStorage.getItem("name"), text: chatInput },
      });
      setChatInput("");
    }
  };

  return (
    <>
      <div className={classes.player}>
        <div></div>
        <div className={classes["video-wrapper"]}>
          <video
            src={props.url}
            ref={videoRef}
            onDurationChange={setTotalTime}
            onTimeUpdate={(e) => {
              setPassedDuration(e.target.currentTime);
            }}
            autoPlay={false}
          />
        </div>
        <div className={classes["video-overlay"]}>
          <div className={classes["video-cover"]}>
            <div className={classes["left"]} onDoubleClick={moveBack}></div>
            <div
              className={classes["play"]}
              // onClick={() => { dispatcher("playbackToggle") }}

              // onDurationChange={dispatcher("updatePlaybackDuration")}

              ref={playButtonRef}
            >
              {/* <div className={classes["central-icon"]}>
                {isVideoOver && (
                  <FontAwesomeIcon
                    icon={faRotateRight}
                    onClick={replay}
                  ></FontAwesomeIcon>
                )}
              </div> */}
            </div>
            <div className={classes["right"]} onDoubleClick={moveForward}></div>
          </div>
          <div className={classes["control-bar"]}>
            <div
              className={classes["progress-bar-wrapper"]}
              onClick={jumpToTime}
            >
              <div className={classes["progress-bar"]}>
                <div
                  className={classes.currentTime}
                  style={{
                    width:
                      (videoWidth * passedDuration) / totalDuration
                        ? (videoWidth * passedDuration) / totalDuration
                        : 0,
                  }}
                ></div>
                <div
                  className={classes.bufferedTime}
                  style={{
                    width:
                      (videoWidth * bufferedDuration) / totalDuration
                        ? (videoWidth * bufferedDuration) / totalDuration
                        : 0,
                  }}
                ></div>
              </div>
            </div>
            <div className={classes["icon-bar"]}>
              <div className={classes["left-icons"]}>
                <span>
                  {!isVideoOver &&
                    (isVideoPlaying && !isVideoOver ? (
                      <Pause onClick={() => dispatcher("playbackToggle")} />
                    ) : (
                      <Play onClick={() => dispatcher("playbackToggle")} />
                    ))}
                  {/* {isVideoOver ? (
                    <FontAwesomeIcon icon={faRotateRight} onClick={replay} />
                  ) : null} */}
                </span>
                <span>
                  <Next />
                </span>
                <span onClick={toggleSound} style={{ padding: "6px" }}>
                  {soundStatus ? <VolumeOn /> : <Mute />}
                </span>
                <span className={classes.time}>
                  {formatTime(Math.floor(passedDuration))}/
                  {formatTime(Math.floor(totalDuration))}
                </span>
              </div>
              <div className={classes["right-icons"]}>
                {/* <span className={classes["settings"]}>
                  <SettingsLogo />
                </span>
                <span
                  className={classes["widescreen"]}
                  onClick={handleWideScreen}
                >
                  <WidescreenLogo />
                </span>
                <span
                  className={classes["fullscreen"]}
                  onClick={handleFullScreen}
                >
                  <FontAwesomeIcon icon={faExpand}></FontAwesomeIcon>
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat">
        <div className="messages">
          {messages.map((message) => (
            <div className="message">
              <h5>{message.payload.name}</h5>

              <p>{message.payload.text}</p>
            </div>
          ))}
        </div>
        <div className="input">
          <input
            type="text"
            tabIndex="0"
            placeholder="Message"
            onKeyDown={handleKeypress}
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
            }}
            style={{ maxWidth: "90% !important" }}
          ></input>
        </div>
      </div>
    </>
  );
}
