import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [segment, setSegment] = useState('A4A4B4');
  const [rhythm, setRhythm] = useState(3);
  const [polyphony, setPolyphony] = useState(2);
  const [tempo, setTempo] = useState(100);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('segment', segment);
    formData.append('rhythm', rhythm);
    formData.append('polyphony', polyphony);
    formData.append('tempo', tempo);

    try {
      const response = await axios.post('http://localhost:8000/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('MIDI generated:', response.data);
      setDownloadLinks([
        { label: 'Download Piano Arrangement', url: `http://localhost:8000/download/${response.data.piano_path.split('/').pop()}` },
        { label: 'Download Band Arrangement', url: `http://localhost:8000/download/${response.data.band_path.split('/').pop()}` },
      ]);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error generating MIDI:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : { message: error.message });
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload File</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div>
          <label>Segment</label>
          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} />
        </div>
        <div>
          <label>Rhythm Intensity</label>
          <input type="number" value={rhythm} onChange={(e) => setRhythm(e.target.value)} />
        </div>
        <div>
          <label>Polyphonic Density</label>
          <input type="number" value={polyphony} onChange={(e) => setPolyphony(e.target.value)} />
        </div>
        <div>
          <label>BPM</label>
          <input type="number" value={tempo} onChange={(e) => setTempo(e.target.value)} />
        </div>
        <button type="submit">Generate</button>
      </form>
      {error && (
        <div className="error">
          <p>Error: {error.message}</p>
          {error.details && <pre>{JSON.stringify(error.details, null, 2)}</pre>}
        </div>
      )}
      {downloadLinks.length > 0 && (
        <div>
          {downloadLinks.map((link, index) => (
            <div key={index}>
              <button onClick={() => window.location.href = link.url}>{link.label}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
