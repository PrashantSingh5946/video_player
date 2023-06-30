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
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const playButtonRef = useRef();
  const [passedDuration, setPassedDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bufferedDuration, setBufferedDuration] = useState(0);
  const [soundStatus, setSoundStatus] = useState(true);
  const [isVideoOver, setIsVideoOver] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [socketStatus, setSocketStatus] = useState(false);

  function formatTime(seconds) {
    return [parseInt((seconds / 60) % 60), parseInt(seconds % 60)]
      .join(":")
      .replace(/\b(\d)\b/g, "0$1");
  }


  function dispatcher(event) {

    emitSocketMessage({ "event": event });

    //functionMap[event]();

  }

  const emitSocketMessage = (message) => {

    if (socketStatus) {
      console.log(message)
      window.ws.send(JSON.stringify(message));
    }

  }


  const fullscreenchanged = (event) => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
    }
  };

  //manage fullscreen listener
  useEffect(() => {
    document.onfullscreenchange = fullscreenchanged;
    let ws = new WebSocket(`wss://${window.location.hostname}:8000`);
    window.ws = ws;
    ws.addEventListener("open", () => { setSocketStatus(true); console.log("Socket open") })

    ws.addEventListener("close", () => { setSocketStatus(false); console.log("Socket closed") })

    ws.addEventListener("message", (packet) => {



      packet.data.text().then((res) => {        

        let data = JSON.parse(res);

          //Object.keys(data).indexOf("event")!= -1 ?? functionMap[data["event"]]();

          let func = functionMap[data["event"]];

          func();

          console.log("Invoking function " + data["event"])
          console.log(data)
      })

    })


  }, []);

  const functionMap = {

    "playbackToggle" : () => {

      console.log("Function has been called")
      //play and pause functionality
      setVideoPlaying((isVideoPlaying) => !isVideoPlaying);
    }

  }

  //replay functionality
  const replay = async () => {
    console.log("Video playing");
    setIsVideoOver(false);
    setTimeout(() => {
      videoRef.current.play();
      setVideoPlaying(true);
    }, 500);
  };

  const updatePlaybackDuration = () => {
    setPassedDuration(videoRef.current.currentTime);
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
    let equivalentDuration = (clickpoint / 850) * totalDuration;
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

  useEffect(() => {
    if (isFullScreen) {
      document.documentElement.requestFullscreen();
      var r = document.querySelector(":root");
      // Set the value of variable --blue to another value (in this case "lightblue")
      r.style.setProperty("--video-height", window.screen.height);
      r.style.setProperty("--video-width", window.screen.width);
    } else if (totalDuration) {
      var r = document.querySelector(":root");
      // Set the value of variable --blue to another value (in this case "lightblue")
      r.style.setProperty("--video-height", "510px");
      r.style.setProperty("--video-width", "860px");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleWideScreen = () => { };

  return (
    <div className={classes.player}>
      <div className={classes["video-wrapper"]}>
        <video
          src={props.url}
          ref={videoRef}
          onDurationChange={setTotalTime}
          onTimeUpdate={updatePlaybackDuration}
          autoPlay={false}
          muted={false}
        />
      </div>
      <div className={classes["video-overlay"]}>
        <div className={classes["video-cover"]}>
          <div className={classes["left"]} onDoubleClick={moveBack}></div>
          <div
            className={classes["play"]}
            onClick={() => { dispatcher("playbackToggle") }}
            onDurationChange={updatePlaybackDuration}
            ref={playButtonRef}
          >
            <div className={classes["central-icon"]}>
              {isVideoOver && (
                <FontAwesomeIcon
                  icon={faRotateRight}
                  onClick={replay}
                ></FontAwesomeIcon>
              )}
            </div>
          </div>
          <div className={classes["right"]} onDoubleClick={moveForward}></div>
        </div>
        <div className={classes["control-bar"]}>
          <div className={classes["progress-bar-wrapper"]} onClick={jumpToTime}>
            <div className={classes["progress-bar"]}>
              <div
                className={classes.currentTime}
                style={{
                  width:
                    (850 * passedDuration) / totalDuration
                      ? (850 * passedDuration) / totalDuration
                      : 0,
                }}
              ></div>
              <div
                className={classes.bufferedTime}
                style={{
                  width:
                    (850 * bufferedDuration) / totalDuration
                      ? (850 * bufferedDuration) / totalDuration
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
                    <Pause onClick={functionMap["playbackToggle"]} />
                  ) : (
                    <Play onClick={functionMap["playbackToggle"]} />
                  ))}
                {isVideoOver ? (
                  <FontAwesomeIcon icon={faRotateRight} onClick={replay} />
                ) : null}
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
              <span className={classes["settings"]}>
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
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
