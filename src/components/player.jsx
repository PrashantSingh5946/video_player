import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faForwardStep,
  faVolumeHigh,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./styles.module.css";

export default function Player(props) {
  const videoRef = useRef();
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const playButtonRef = useRef();
  const [passedDuration, setPassedDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

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
    if (videoRef.current.currentTime > 10) {
      videoRef.current.currentTime = videoRef.current.currentTime - 10;
    } else {
      videoRef.current.currentTime = 0;
    }
  };
  const moveForward = () =>
{
    if(videoRef.current.currentTime+10<videoRef.current.duration)
    {
        videoRef.current.currentTime=videoRef.current.currentTime + 10;
    }
    else
    {
        videoRef.current.currentTime=videoRef.current.duration;
    }
}
  //update time on play
  const setTotalTime = () => {
    setTotalDuration(videoRef.current.duration);
  };

  return (
    <div className={classes.player}>
      <div className={classes["video-wrapper"]}>
        <video
          src={props.url}
          ref={videoRef}
          onDurationChange={setTotalTime}
          autoPlay
        />
      </div>
      <div className={classes["video-overlay"]}>
        <div className={classes["video-cover"]}>
          <div className={classes["left"]} onDoubleClick={moveBack}></div>
          <div
            className={classes["play"]}
            onClick={playbackToggle}
            onDurationChange={updatePlaybackDuration}
            ref={playButtonRef}
          ></div>
          <div className={classes["right"]} onDoubleClick={moveForward}></div>
        </div>
        <div className={classes["control-bar"]}>
          <div className={classes["progress-bar"]}></div>
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
              <span>
                <FontAwesomeIcon icon={faVolumeHigh} />
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
