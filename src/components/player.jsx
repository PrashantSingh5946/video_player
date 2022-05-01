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

  //play pause functionality
  const playbackToggle = () => {
    //play and pause functionality
    setVideoPlaying((isVideoPlaying) => !isVideoPlaying);
  };

  const updatePlaybackDuration = () => {
    setPassedDuration(videoRef.current.currentTime);
    console.log(passedDuration);
  };
  //handle play pause
  useEffect(() => {
    if (isVideoPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isVideoPlaying]);

  //autoplay on startup

  //update time on play

  return (
    <div className={classes.player}>
      <div className={classes["video-wrapper"]}>
        <video src={props.url} ref={videoRef} autoPlay />
      </div>
      <div className={classes["video-overlay"]}>
        <div className={classes["video-cover"]}>
          <div className={classes["left"]}></div>
          <div
            className={classes["play"]}
            onClick={playbackToggle}
            onDurationChange={updatePlaybackDuration}
            ref={playButtonRef}
          ></div>
          <div className={classes["right"]}></div>
        </div>
        <div className={classes["control-bar"]}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
