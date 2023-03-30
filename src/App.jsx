import {useState} from 'react';
import { Routes, Route, Link } from "react-router-dom";

import './App.css';
import 'react-data-grid/lib/styles.css';

import AccessTable from "./components/AccessTable";
import UserDataGrid from './components/UserDataGrid';
import IsTable from './components/IsTable';
import ResourceTable from './components/ResourceTable';
import RoleTable from './components/RoleTable';
import Test from './components/Test'
import AuthPage from './components/AuthPage';
import { Button } from '@chakra-ui/react';

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div>
      {isAuth && <nav className='navbar'>
        <div className='navbar-nav'>
          <li className='nav-item'>
            <a href='/access' className='navbar-brand'>
              RosAtom
            </a>
          </li>
          <li className='nav-item'>
            <Link to={"/access"} className="nav-link">
              Доступ
            </Link>
          </li>
          <li className='nav-item'>
            <Link to={"/users"} className="nav-link">Пользователи</Link>
          </li>
          <li className='nav-item'>
            <Link to={"/test"} className="nav-link">Test</Link>
          </li>
        </div>
        {isAdmin && <div className='admin-wrapper'>
          <Button className='login-item' colorScheme='white' variant='link'>Регистрация</Button>
          <Button className='login-item' colorScheme='white' variant='link'>Сменить пароль</Button>
        </div>}
        <div className='login-wrapper'>
          <div className='login-item login-email'>temp@rosatom.ru</div>
          <Button className='login-item' colorScheme='white' variant='link'>Выйти</Button>
        </div>
      </nav>}

      <main className='mainClassname'>
        <Routes>
          <Route path='/auth' element={<AuthPage/>}/>
          <Route path='/access' element={<AccessTable/>}/>
          <Route path='/users' element={<UserDataGrid/>}/>
          <Route path='/is' element={<IsTable/>}/>
          <Route path='/resource' element={<ResourceTable/>}/>
          <Route path='/role' element={<RoleTable/>}/>
          <Route path='/test' element={<Test/>}/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
