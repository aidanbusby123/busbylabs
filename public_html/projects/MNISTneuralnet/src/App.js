import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState([]); // Store probabilities for each digit

  const gridSize = 28; // The grid is 28x28
  const canvasSize = 560; // The canvas is 560x560
  const blockSize = canvasSize / gridSize; // Size of each block in the grid
  let isDrawing = false; // Track whether the user is drawing

  // Function to clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; // Set the canvas background to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with white
  };

  // Clear the canvas on initial load
  useEffect(() => {
    clearCanvas();

    // Prevent touch scrolling on the canvas
    const canvas = canvasRef.current;

    const preventTouchScroll = (e) => {
      e.preventDefault();
    };

    canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });
    canvas.addEventListener('touchstart', preventTouchScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', preventTouchScroll);
      canvas.removeEventListener('touchstart', preventTouchScroll);
    };
  }, []);

  // Function to send the canvas data to the backend
  const predictDigit = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const grayscaleData = [];

    // Convert the canvas data to grayscale and normalize
    for (let i = 0; i < imageData.data.length; i += 4) {
      const grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      const normalized = 1 - grayscale / 255; // Invert so 0 is white and 1 is black
      grayscaleData.push(normalized);
    }

    const resizedData = [];
    const scale = canvas.width / gridSize;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const startX = Math.floor(x * scale);
        const startY = Math.floor(y * scale);
        const endX = Math.floor((x + 1) * scale);
        const endY = Math.floor((y + 1) * scale);

        let sum = 0;
        let count = 0;
        for (let yy = startY; yy < endY; yy++) {
          for (let xx = startX; xx < endX; xx++) {
            const pixelIndex = yy * canvas.width + xx;
            sum += grayscaleData[pixelIndex];
            count++;
          }
        }
        resizedData.push(sum / count);
      }
    }

    try {
      const response = await axios.post('https://busbylabs.com/projects/MNISTneuralnet/predict', {
        image: resizedData,
      });

      console.log("Backend Response:", response.data); // Debugging

      setPrediction(response.data.digit);
      setProbabilities(response.data.probabilities || []); // Handle missing probabilities
    } catch (error) {
      console.error('Error predicting digit:', error);
    }
  };

  // Function to start drawing
  const startDrawing = (x, y) => {
    isDrawing = true;
    drawBlock(x, y); // Start drawing immediately
  };

  // Function to draw a block on the canvas
  const drawBlock = (x, y) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate the grid cell (block) based on the current position
    const gridX = Math.floor(x / blockSize) * blockSize;
    const gridY = Math.floor(y / blockSize) * blockSize;

    // Draw a filled rectangle (block) at the grid cell
    ctx.fillStyle = 'black';
    ctx.fillRect(gridX, gridY, blockSize, blockSize);
  };

  // Function to stop drawing
  const stopDrawing = () => {
    isDrawing = false;
  };

  // Function to handle mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // Account for scaling
    const scaleY = canvasRef.current.height / rect.height; // Account for scaling
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    startDrawing(x, y);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // Account for scaling
    const scaleY = canvasRef.current.height / rect.height; // Account for scaling
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    drawBlock(x, y);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  // Function to handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // Account for scaling
    const scaleY = canvasRef.current.height / rect.height; // Account for scaling
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    startDrawing(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // Account for scaling
    const scaleY = canvasRef.current.height / rect.height; // Account for scaling
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    drawBlock(x, y);
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Draw a Digit</h1>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          border: '1px solid black',
          width: '90vw', // Responsive width for mobile
          maxWidth: `${canvasSize}px`, // Limit maximum width
          height: 'auto', // Maintain aspect ratio
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div>
        <button
          onClick={predictDigit}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            margin: '10px',
            cursor: 'pointer',
          }}
        >
          Predict
        </button>
        <button
          onClick={clearCanvas}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            margin: '10px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
      {prediction !== null && <h2>Predicted Digit: {prediction}</h2>}

      {Array.isArray(probabilities) && probabilities.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Prediction Probabilities</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
            {probabilities.map((prob, index) => (
              <div key={index} style={{ textAlign: 'center', margin: '5px' }}>
                <div
                  style={{
                    width: '20px', // Adjust width for smaller screens
                    height: `${prob * 100}%`,
                    backgroundColor: 'blue',
                    margin: '0 auto',
                  }}
                ></div>
                <span style={{ fontSize: '12px' }}>{index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;