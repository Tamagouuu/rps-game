import * as tf from "@tensorflow/tfjs";
import { useEffect, useState, useRef } from "react";

function RPSDetector({ choice, makeChoiceFn }: { makeChoiceFn: (choice: string) => void; choice: string | null }) {
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

  const captureAndPredict = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        handlePrediction(canvas);
      }
    }
  };

  return (
    <div>
      <h1 className="text-center text-gray-400 text-lg font-bold mb-2 uppercase">You can play with 📸</h1>
      <video ref={videoRef} id="webcam" playsInline width="300" className="rounded-lg shadow-md" height="200" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div>
        <div className="my-2">
          {prediction.trim() !== "" && (
            <h2 className="capitalize">
              Prediction:{" "}
              <span className="font-bold ">
                {prediction} {prediction == "rock" ? "🪨" : prediction == "paper" ? "📃" : "✂️"}
              </span>
            </h2>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={captureAndPredict}
            className={`px-4 py-2 rounded-md  ${
              choice ? "bg-gray-300 cursor-not-allowed" : "bg-slate-400 hover:bg-slate-500 text-white"
            }`}
            disabled={!!choice}
          >
            📸 Capture
          </button>
          {choice === null && (
            <button
              onClick={() => {
                makeChoiceFn(prediction);
              }}
              className={`px-4 py-2 rounded-md  ${
                (prediction.trim() === "" ? true : false)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={prediction.trim() === "" ? true : false}
            >
              ✈️ Send Predict
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RPSDetector;
