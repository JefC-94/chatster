import React, {useState, createContext } from 'react'

export const ModalContext = createContext();

function ModalContextProvider({children}) {

    const [snackBar, setSnackBar] = useState({
        open: false,
        message: ''
    });
    
    return (
        <ModalContext.Provider value={{
            snackBar: snackBar,
            setSnackBar: setSnackBar
        }}>
            {children}
        </ModalContext.Provider>
    )
}

export default ModalContextProvider
