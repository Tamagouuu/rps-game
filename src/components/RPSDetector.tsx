import * as tf from "@tensorflow/tfjs";
import { useEffect, useState, useRef } from "react";

function RPSDetector() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [prediction, setPrediction] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadLayersModel("/rps_model/model.json");
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    const setupWebcam = async () => {
      const video = videoRef.current;
      if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.play();
        } catch (err) {
          console.error("Error accessing webcam: ", err);
        }
      } else {
        console.error("getUserMedia not supported on your browser!");
      }
    };
    setupWebcam();
  }, []);

  const handlePrediction = async (image: HTMLCanvasElement) => {
    if (!model) return;

    // Preprocess image
    const resizedImage = tf.browser.fromPixels(image).resizeBilinear([128, 128]);
    const normalizedImage = resizedImage.div(255.0).expandDims(0);

    // Predict
    const predictions = (model.predict(normalizedImage) as tf.Tensor).arraySync() as number[][];
    const labels = ["paper", "rock", "scissors"];
    const predictedLabel = labels[predictions[0].indexOf(Math.max(...predictions[0]))];
    setPrediction(predictedLabel);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          handlePrediction(canvas);
        }
      }
    }, 300); // Predict every 300ms

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [model]);

  return (
    <div>
      <h1>Rock Paper Scissors Prediction</h1>
      <video ref={videoRef} id="webcam" autoPlay playsInline width="400" height="300" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <h2>Prediction: {prediction}</h2>
    </div>
  );
}

export default RPSDetector;
