import React from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';



createRoot(document.getElementById('root')).render(

    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </ChakraProvider>
 
);
