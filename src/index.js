import React from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';



createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </ChakraProvider>
  // </React.StrictMode> 
);
