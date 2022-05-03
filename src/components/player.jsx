import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faForwardStep,
  faVolumeHigh,
  faPause,
  faVolumeMute,
  faRepeat,
  faRotateRight,
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

  function formatTime(seconds) {
    return [parseInt((seconds / 60) % 60), parseInt(seconds % 60)]
      .join(":")
      .replace(/\b(\d)\b/g, "0$1");
  }

  //play pause functionality
  const playbackToggle = () => {
    //play and pause functionality
    setVideoPlaying((isVideoPlaying) => !isVideoPlaying);
  };

  const updatePlaybackDuration = () => {
    setPassedDuration(videoRef.current.currentTime);
  };

  //handle playback update
  useEffect(() => {
    setInterval(updatePlaybackDuration, 200);
  }, []);

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

  useEffect(() => {
    setBufferedLength();
  }, [passedDuration]);

  const jumpToTime = (e) => {
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

  useEffect(()=>{handleVideoOver()},[passedDuration])

  const handleVideoOver = () => {
    if(passedDuration===totalDuration && passedDuration)
    {
      setIsVideoOver(true);
    }
   
  };
  return (
    <div className={classes.player}>
      <div className={classes["video-wrapper"]}>
        <video src={props.url} ref={videoRef} onDurationChange={setTotalTime} />
      </div>
      <div className={classes["video-overlay"]}>
        <div className={classes["video-cover"]}>
          <div className={classes["left"]} onDoubleClick={moveBack}></div>
          <div
            className={classes["play"]}
            onClick={playbackToggle}
            onDurationChange={updatePlaybackDuration}
            ref={playButtonRef}
          >
            <div className={classes["central-icon"]}>
              {isVideoOver && (
                <FontAwesomeIcon icon={faRotateRight}></FontAwesomeIcon>
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
              <span onClick={playbackToggle}>
                {isVideoPlaying ? (
                  <FontAwesomeIcon icon={faPause} />
                ) : (
                  <FontAwesomeIcon icon={faPlay} />
                )}
              </span>
              <span>
                <FontAwesomeIcon icon={faForwardStep} />
              </span>
              <span onClick={toggleSound}>
                {soundStatus ? (
                  <FontAwesomeIcon icon={faVolumeHigh} />
                ) : (
                  <FontAwesomeIcon icon={faVolumeMute}></FontAwesomeIcon>
                )}
              </span>
              <span className={classes.time}>
                {formatTime(Math.floor(passedDuration))}/
                {formatTime(Math.floor(totalDuration))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
