/** @jsxImportSource @emotion/react */
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
          <Route path="/phone-book-sendiawan-muljono/add" element={<AddContact />} />
          <Route path="/phone-book-sendiawan-muljono" element={<ContactList />} />
          <Route path="/" element={<Navigate to="/phone-book-sendiawan-muljono" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;