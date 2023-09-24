/** @jsxImportSource @emotion/react */
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContactList from './components/ContactList';
import AddContact from './components/AddContact';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { css } from '@emotion/react';

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const titleStyle = css`
  margin: 10px;
  margin-bottom: 20px;
`;

function App() {
  return (
    <Router>
      <div className="App">
        <h1 css={titleStyle}>Sendiawan Muljono's Phone Book</h1>
        <Routes>
          <Route path="/add" element={<AddContact />} />
          <Route path="/" element={<ContactList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;