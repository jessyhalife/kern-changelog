import React from 'react';
import './App.css';
import Projects from "./components/projectsComponent";
import { Navbar, Container, NavbarBrand } from 'react-bootstrap';

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
