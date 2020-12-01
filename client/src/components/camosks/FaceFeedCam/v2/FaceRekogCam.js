import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import styled from "styled-components";

// onChange 사람이 있는지 없는지 > 있으면 , AWS API 호출하게끔

const PERSON_DISAPPER_INTERVAL = 4;

function FaceRekogCam({ onChange, className }) {
  const [, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const canvasRef = useRef();
  const canvasEl = React.createElement("canvas", { ref: canvasRef }, "");

  const videoRef = useRef();
  const videoEl = React.createElement(
    "video",
    {
      ref: videoRef,
      id: "FaceRekogCamVideo",
      width: "250",
      height: "200",
      autoPlay: true,
      muted: true,
    },
    ""
  );

  useEffect(() => {
    const video = videoRef.current; //document.getElementById("FaceRekogCamVideo");

    const startVideo = async () => {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      } catch (err) {
        setError(true);
        console.error(err);
      }
    };

    // 모델이 로딩이 완료되면 비디올르 시작한다.
    const MODELS_URL = `${process.env.PUBLIC_URL}/models`;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
    ]).then(startVideo);

    setLoading(false);

    const handlePlay = video.addEventListener("play", () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      canvas.id = "FaceRekogCamCanvas";
      document.getElementById("FaceRekogCamContainer").appendChild(canvas);

      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        // console.log(detections);
        if (detections.length) {
          // 얼굴인식 2초뒤에 반응
          setCounter((prev) => {
            if (prev >= PERSON_DISAPPER_INTERVAL) {
              onChange(true);
              return prev;
            } else {
              return prev + 1;
            }
          });
        } else {
          setCounter((prev) => {
            if (prev > 0) {
              return prev - 1;
            } else if (prev <= 0) {
              onChange(false);
              return prev;
            }
          });
        }
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }, 500);
    });

    return () => {
      video.removeEventListener("play", handlePlay);
      document
        .getElementById("FaceRekogCamContainer")
        .removeChild(document.querySelector("#FaceRekogCamCanvas"));
    };
  }, [onChange]);

  return (
    <Container className={className} id="FaceRekogCamContainer">
      {loading ? "loading..." : `${error ? "Cam Device is not founded" : ""}`}
      {videoEl}
    </Container>
  );
}

export default FaceRekogCam;

const Container = styled.div`
  position: relative;
  min-width: 250px;
  min-height: 200px;
  #FaceRekogCamVideo {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 250px;
    height: 200px;
  }
  #FaceRekogCamCanvas {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 250px;
    height: 200px;
  }
`;
