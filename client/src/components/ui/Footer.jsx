import React from 'react';
import {NavLink} from 'react-router-dom';

function Footer() {
    return (
        <footer className="mainfooter container">
            <p>Project van Jef Ceuppens</p>
            <NavLink activeClassName="active" className="link" to='/about'>Meer info</NavLink>
        </footer>
    )
}

export default Footer
