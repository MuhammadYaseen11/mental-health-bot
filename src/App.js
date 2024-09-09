import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './App.css';

function App() {
  return (
    <div className="Background">
      <div className="App">
        <h1>Hello and Welcome to the Mental Health Chatbot!</h1>
      </div>
      <div className="InputField">
        <TextField id="outlined-basic" label="Say Hi!" variant="outlined" />
      </div>
      <div className="Button">
        <Button variant="contained">Send</Button>
      </div>
    </div>
  );
}

export default App;
