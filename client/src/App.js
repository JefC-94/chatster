import './scss/style.scss';
import React, {useContext, useEffect} from 'react';
import UserContextProvider from './contexts/UserContext';
import {WindowContext} from './contexts/WindowContext';
import WindowContextProvider from './contexts/WindowContext';
import ModalContextProvider from './contexts/ModalContext';
//import SocketProvider from './contexts/SocketContext';
import Home from './components/Home';
import Footer from './components/ui/Footer';
import {BrowserRouter} from 'react-router-dom';

function App() {
  const {changeWindowWidth} = useContext(WindowContext);

  const updateDimensions = () => {
    const width = window.innerWidth;
    changeWindowWidth(width);
  }

  useEffect(() => {
    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    }
  })

  return (
    <BrowserRouter>
      <UserContextProvider>
        <ModalContextProvider>
          <Home />
        </ModalContextProvider>
        <Footer />
      </UserContextProvider>
    </BrowserRouter>
  );
}

function AppWrapper(){
  return (
    <WindowContextProvider>
      {/*  <SocketProvider> */}
        <App />
      {/* </SocketProvider> */}
    </WindowContextProvider>
  )
}

export default AppWrapper;
