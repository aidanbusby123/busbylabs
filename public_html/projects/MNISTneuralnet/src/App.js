import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState([]); // Store probabilities for each digit

  const blockSize = 20; // Fixed block size
  const brushSize = 10; // Adjust brush size for smoother drawing

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
    const scale = canvas.width / 28;
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
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

  // Function to draw blocks on the canvas
  const drawBlock = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const x1 = Math.floor(x / blockSize) * blockSize;
    const y1 = Math.floor(y / blockSize) * blockSize;

    const x2 = x1 + brushSize;
    const y2 = y1 + brushSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  };

  // Function to handle touch events for mobile users
  const handleTouch = (e) => {
    e.preventDefault(); // Prevent scrolling or refreshing

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const x1 = Math.floor(x / blockSize) * blockSize;
    const y1 = Math.floor(y / blockSize) * blockSize;

    const x2 = x1 + brushSize;
    const y2 = y1 + brushSize;

    ctx.fillStyle = 'black';
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Draw a Digit</h1>
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        style={{
          border: '1px solid black',
          width: '90vw', // Responsive width for mobile
          maxWidth: '560px', // Limit maximum width
          height: 'auto', // Maintain aspect ratio
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return;
          drawBlock(e);
        }}
        onMouseDown={(e) => drawBlock(e)}
        onTouchMove={(e) => handleTouch(e)} // Add touch support
        onTouchStart={(e) => handleTouch(e)} // Add touch support
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