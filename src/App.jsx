import React, {useState} from 'react';
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import './App.css';
import 'react-data-grid/lib/styles.css';

import AccessTable from "./components/AccessTable";
import UserTable from './components/UserTable';
import UserDataGrid from './components/UserDataGrid';

function App() {

  const [direction, setDirection] = useState('ltr');

  return (
    <div>
      <nav className='navbar navbar-expand navbar-dark bg-dark'>
        <a href='/access' className='navbar-brand'>
          RosAtom
        </a>
        <div className='navbar-nav mr-auto'>
          <li className='nav-item'>
            <Link to={"/access"} className="nav-link">
              Access
            </Link>
          </li>
          <li className='nav-item'>
            <Link to={"/users"} className="nav-link">Users</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/company"} className="nav-link">Company</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/status"} className="nav-link">Status</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/Department"} className="nav-link">Department</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/System"} className="nav-link">System</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/role"} className="nav-link">Role</Link>
          </li>
        </div>
      </nav>

      <div className='mainClass'>
        <Routes>
          <Route path="/" element={<UserDataGrid direction={direction}/>}/>
          <Route path="/access" element={<AccessTable/>}/>
          <Route path="/users" element={<UserTable/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
