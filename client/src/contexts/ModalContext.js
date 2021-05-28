import React, {useState, createContext } from 'react'

export const ModalContext = createContext();

function ModalContextProvider({children}) {

    const [snackBar, setSnackBar] = useState({
        open: false,
        message: ''
    });

    const [messageSnackBar, setMessageSnackBar] = useState({
        open: false,
        data: {
            user: {
                
            }
        },
    });
    
    return (
        <ModalContext.Provider value={{
            snackBar,
            setSnackBar,
            messageSnackBar,
            setMessageSnackBar
        }}>
            {children}
        </ModalContext.Provider>
    )
}

export default ModalContextProvider
