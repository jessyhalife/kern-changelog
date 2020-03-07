import React from 'react';
import logo from './logo.svg';
import './App.css';
import Projects from "./components/projectsComponent";
import { Navbar } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Navbar bg="light" style={{marginBottom: "40px"}}>
        <Navbar.Brand href="#">
          <span>Control de versiones</span> 
        </Navbar.Brand>
      </Navbar>
      <Projects />
    </div>
  );
}
export default App;
