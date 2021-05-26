import React, {useState, useContext, useLayoutEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import {WindowContext} from '../../contexts/WindowContext';
import DarkToggle from '../ui/DarkToggle';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';
import {FaBars, FaTimes} from 'react-icons/fa';

function Header({match}) {
    
    //CONTEXTS
    const {windowWidth} = useContext(WindowContext);
    
    //USER
    const {rootState,logoutUser} = useContext(UserContext);
    const {theUser} = rootState;

    //STATES
    const [showMenu, setShowMenu] = useState(false);

    //REFS
    const dropdownMenu = useRef();
    const dropdownBtn = useRef();

    //Use Layout Effect -> user clicks out of Dropdown Menu -> hide menu
    useLayoutEffect(() => {
        const handleWindowClick = (e) => {
            if(e.target !== dropdownBtn.current){
                setShowMenu(false);
            }
        }
        window.addEventListener('click', handleWindowClick);
        return () => {
            window.removeEventListener('click', handleWindowClick);
        }
    }, []);

    return (
        <header className="mainheader container">
            
            <div className="current-user">
                <img src={theUser.photo_url ? `${imgPath}/${theUser.photo_url}` : profilepic} alt="" />
                <h1 className="dashboard">{theUser.username}</h1>
                <h2>{theUser.last_login}</h2>
            </div>
            
            <div className="navbar">
                {/* Navbar on big screen */}
                {windowWidth > 800 && 
                <>
                    <Link to={`${match.path}/profile`}>
                        <button className="button secondary menu" id="editProfileBtn" >Edit profile</button>
                    </Link>
                    <button className="button primary" id="logoutBtn" onClick={logoutUser}>Logout</button>
                    <DarkToggle />
                </>
                }
                {/* Navbar on small screen */}
                {windowWidth < 800 && 
                    <button ref={dropdownBtn} id="dropdownBtn" className="circle secondary flex" onClick={() => {setShowMenu(prevVal => !prevVal)}}>
                        {!showMenu ? <FaBars size={15} /> : <FaTimes size={15} />}
                    </button>
                }
            </div>

            {/* RESPONSIVE MENU on smallscreens */}
            {showMenu && windowWidth < 800 && 
                <div className="dropdown-options menu" ref={dropdownMenu}>
                    <Link className="dropdown-option" to={`${match.path}/profile`}>
                        <button className="button secondary" id="editProfileBtn" >Edit profile </button>
                    </Link>
                    <div className="dropdown-option">
                        <button className="button primary" id="logoutBtn" onClick={logoutUser} >Logout </button>
                    </div>
                    <div className="dropdown-option" to="/"><DarkToggle /></div>
                </div>
            }

        </header>
    )
}

export default Header
