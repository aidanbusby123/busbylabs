import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState([]); // Store probabilities for each digit

  const blockSize = 20; // Fixed block size
  const brushSize = 2 * blockSize; // Brush size is 2x the block size

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
      // Convert to grayscale (average of R, G, B)
      const grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

      // Normalize: 0 (white) to 1 (black)
      const normalized = 1 - grayscale / 255; // Invert so 0 is white and 1 is black
      grayscaleData.push(normalized);
    }

    console.log("Grayscale Data:", grayscaleData); // Debugging

    // Resize the image to 28x28 (MNIST format)
    const resizedData = [];
    const scale = canvas.width / 28;
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const startX = Math.floor(x * scale);
        const startY = Math.floor(y * scale);
        const endX = Math.floor((x + 1) * scale);
        const endY = Math.floor((y + 1) * scale);

        // Average the grayscale values in the block
        let sum = 0;
        let count = 0;
        for (let yy = startY; yy < endY; yy++) {
          for (let xx = startX; xx < endX; xx++) {
            const pixelIndex = yy * canvas.width + xx;
            sum += grayscaleData[pixelIndex];
            count++;
          }
        }
        resizedData.push(sum / count); // Average grayscale value for the block
      }
    }

    console.log("Resized Data:", resizedData); // Debugging

    try {
      // Send the image data to the backend
      const response = await axios.post('https://busbylabs.com/projects/MNISTneuralnet/predict', {
        image: resizedData,
      });

      // Extract prediction and probabilities
      setPrediction(response.data.digit);
      setProbabilities(response.data.probabilities); // Store probabilities for rendering
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

    // Calculate the bottom-right corner of the block (brush size is 2 * blockSize)
    const x2 = x1 + brushSize;
    const y2 = y1 + brushSize;

    console.log(`Drawing block at (${x1}, ${y1}) to (${x2}, ${y2})`); // Debugging

    // Draw a filled rectangle (block)
    ctx.fillStyle = 'black';
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Draw a Digit</h1>
      <canvas
        ref={canvasRef}
        width={560} // Fixed canvas size to match Tkinter
        height={560} // Fixed canvas size to match Tkinter
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

      {/* Render probability bars */}
      {probabilities.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Prediction Probabilities</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {probabilities.map((prob, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '30px',
                    height: `${prob * 100}%`, // Scale height based on probability
                    backgroundColor: 'blue',
                    margin: '0 auto',
                  }}
                ></div>
                <span>{index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;