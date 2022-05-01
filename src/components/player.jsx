import React, { useEffect, useRef, useState } from "react";
import classes from "./styles.module.css";

export default function Player(props) {
    const videoRef = useRef();
    const [isVideoPlaying,setVideoPlaying] = useState(false);

    const playbackToggle = () =>
    {
        //play and pause functionality
        setVideoPlaying((isVideoPlaying) => !isVideoPlaying);
    }

    useEffect( ()=>{
        console.log(isVideoPlaying);
        if(isVideoPlaying)
        {
            videoRef.current.play();
        }
        else
        {
            videoRef.current.pause();
        }

    }, [isVideoPlaying]);
  return (
    <div className={classes.player}>
      <div className={classes["video-wrapper"]}>
        <video src={props.url} ref={videoRef} />
      </div>
      <div className={classes["video-cover"]}>
          <div className={classes["left"]}></div>
          <div className={classes["play"]} onClick={playbackToggle}></div>
          <div className={classes["right"]}></div>
        </div>
    </div>
  );
}
