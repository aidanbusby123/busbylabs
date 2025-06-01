import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [blockSize, setBlockSize] = useState(10); // Size of each block

  // Function to calculate and set block size based on screen dimensions
  useEffect(() => {
    const calculateBlockSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = Math.min(width, height) / 28; // 1/28th of the smaller dimension
      setBlockSize(size);
    };

    calculateBlockSize();
    window.addEventListener('resize', calculateBlockSize); // Recalculate on window resize

    return () => {
      window.removeEventListener('resize', calculateBlockSize);
    };
  }, []);

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

  // Function to draw blocks on the canvas
  const drawBlock = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Get the mouse position relative to the canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the top-left corner of the block
    const x1 = Math.floor(x / blockSize) * blockSize;
    const y1 = Math.floor(y / blockSize) * blockSize;

    // Draw a filled rectangle (block)
    ctx.fillStyle = 'black';
    ctx.fillRect(x1, y1, blockSize, blockSize);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Draw a Digit</h1>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        style={{ border: '1px solid black' }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return; // Only draw when the left mouse button is pressed
          drawBlock(e);
        }}
        onMouseDown={(e) => drawBlock(e)} // Draw on mouse down
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