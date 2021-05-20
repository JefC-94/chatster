import React, { createContext, useState } from 'react'

export const WindowContext = createContext({});

function WindowContextProvider(props) {
    const [windowWidth, setWindowWidth] = useState(0);

    function changeWindowWidth(width){
        setWindowWidth(width);
    }

    return (
        <WindowContext.Provider value={{
            windowWidth: windowWidth,
            changeWindowWidth: changeWindowWidth
        }}>
            {props.children}
        </WindowContext.Provider>
    )
}

export default WindowContextProvider
