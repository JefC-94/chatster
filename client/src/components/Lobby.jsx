import React, {useState, useContext} from 'react';
import Login from './user/Login';
import Register from './user/Register';
import DarkToggle from './ui/DarkToggle';
import {ReactComponent as Chatsterlogo} from '../images/chatster-logo.svg';
import {ReactComponent as Chatstername} from '../images/chatster-name.svg';
import {UserContext} from './../contexts/UserContext';

function Lobby() {
    
    //CONTEXTS
    const {loginUser,isLoggedIn} = useContext(UserContext);
    
    //STATES
    const [showLogin, setShowLogin] = useState(true);

    //Declare demouser for instant login
    const demoUser = {
        email:'steve@hotmail.com',
        password:'azertyui',
    }

    const demoLogin = async () => {
        const data = await loginUser(demoUser);
        if(data.success && data.token){
            localStorage.setItem('loginToken', data.token);
            await isLoggedIn();
        }
    }

    return (
        <main className="lobby-main container">
        <div className='lobby'>
            <div className="darktoggle-container">
                <DarkToggle />
            </div>
            <div className='lobby-panel'>
                <div className="logo-wrap">
                    <Chatsterlogo className="chatster-logo" />
                    <Chatstername className="chatster-name" />
                </div>
                <div className="panel-wrap">
                    {showLogin && <Login setShowLogin={setShowLogin} />}
                    {!showLogin && <Register setShowLogin={setShowLogin} />}
                </div>
            </div>
        </div>
        <div className="disclaimer">
            <div className="demo-wrap">
                <p>If you want to quickly see the app in working, login as one of the demo users</p>
                <button className="button primary" type="button" onClick={() => demoLogin()}>View demo</button>
            </div>
        </div>
        </main>
    )
}

export default Lobby
