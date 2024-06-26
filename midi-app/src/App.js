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
  const [loading, setLoading] = useState(false); // Loading state

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the generation starts
    const formData = new FormData();
    formData.append('file', file);
    formData.append('segment', segment);
    formData.append('rhythm', rhythm);
    formData.append('polyphony', polyphony);
    formData.append('tempo', tempo);

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('MIDI generated:', response.data);
      setDownloadLinks([
        { label: 'Download Piano Arrangement', url: `http://127.0.0.1:8000/download/${response.data.piano_path.split('/').pop()}` },
        { label: 'Download Band Arrangement', url: `http://127.0.0.1:8000/download/${response.data.band_path.split('/').pop()}` },
      ]);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error generating MIDI:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : { message: error.message });
    } finally {
      setLoading(false); // Set loading to false when the generation is complete
    }
  };

  return (
    <div className="App">
      <header className="header">
        <img src="/logo.png" alt="Melception Logo" className="logo" />
        <h1 className="title">Melception</h1>
      </header>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-group">
          <label className="upload-label">
            Upload File
            <input type="file" onChange={handleFileChange} className="file-input" />
          </label>
          {file && <span className="file-name">{file.name}</span>}
        </div>
        <div className="input-group">
          <label>Segment</label>
          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} className="text-input" />
        </div>
        <div className="input-group">
          <label>BPM</label>
          <input type="number" value={tempo} onChange={(e) => setTempo(e.target.value)} className="text-input" />
        </div>
        <div className="input-group">
          <label>Rhythm Intensity</label>
          <input type="number" value={rhythm} onChange={(e) => setRhythm(e.target.value)} className="text-input" />
        </div>
        <div className="input-group">
          <label>Polyphonic Density</label>
          <input type="number" value={polyphony} onChange={(e) => setPolyphony(e.target.value)} className="text-input" />
        </div>
        <div className="button-container">
          <button type="submit" className="generate-button" disabled={loading}>
            {loading ? 'Processing ...' : 'Generate'}
          </button>
          {loading && <div className="spinner"></div>} {/* Show spinner when loading */}
        </div>
      </form>
      {error && (
        <div className="error">
          <p>Error: {error.message}</p>
          {error.details && <pre>{JSON.stringify(error.details, null, 2)}</pre>}
        </div>
      )}
      {downloadLinks.length > 0 && (
        <div className="download-links">
          {downloadLinks.map((link, index) => (
            <div key={index}>
              <button onClick={() => window.location.href = link.url} className="download-button">{link.label}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
