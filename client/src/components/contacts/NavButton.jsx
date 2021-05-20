import React from 'react'

//NAVBUTTONS USED IN CONTACTS COMPONENT WHEN WINDOW IS SMALLSCREEN

function NavButton({link, activeTab, setActiveTab}) {
    return (
        <button 
            className={activeTab === link ? "activeLink" : ""} 
            onClick={() => setActiveTab(link)} 
        >{link}</button>
    )
}

export default NavButton
