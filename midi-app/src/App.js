import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [segment, setSegment] = useState('A4A4B4');
  const [rhythm, setRhythm] = useState(3);
  const [polyphony, setPolyphony] = useState(2);
  const [tempo, setTempo] = useState(100);
  const [downloadLink, setDownloadLink] = useState(null);
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
      const response = await axios.post('http://api.melception.com:8000/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('MIDI generated:', response.data);
      setDownloadLink({
        label: 'Download Band Arrangement',
        url: `http://api.melception.com:8000/download/${response.data.band_path.split('/').pop()}`,
      });
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
      {downloadLink && (
        <div className="download-link">
          <button onClick={() => window.location.href = downloadLink.url} className="download-button">{downloadLink.label}</button>
        </div>
      )}
    </div>
  );
}

export default App;
