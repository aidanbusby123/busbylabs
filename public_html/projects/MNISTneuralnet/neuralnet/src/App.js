import React, { useRef, useState } from 'react';
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);

  // Function to clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Function to send the canvas data to the backend
  const predictDigit = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const grayscaleData = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Convert to grayscale (average of R, G, B)
      const grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      grayscaleData.push(grayscale);
    }

    // Resize the image to 28x28 (MNIST format)
    const resizedData = [];
    const scale = canvas.width / 28;
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const pixelIndex = Math.floor(y * scale) * canvas.width + Math.floor(x * scale);
        resizedData.push(grayscaleData[pixelIndex]);
      }
    }

    try {
      // Send the image data to the backend
      const response = await axios.post('http://localhost:5000/predict', {
        image: resizedData,
      });
      setPrediction(response.data.digit);
    } catch (error) {
      console.error('Error predicting digit:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Draw a Digit</h1>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        style={{ border: '1px solid black' }}
        onMouseDown={(e) => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.beginPath();
          ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return; // Only draw when the left mouse button is pressed
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }}
      />
      <div>
        <button onClick={predictDigit}>Predict</button>
        <button onClick={clearCanvas}>Clear</button>
      </div>
      {prediction !== null && <h2>Predicted Digit: {prediction}</h2>}
    </div>
  );
}

export default App;