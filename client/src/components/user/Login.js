import React, {useContext, useState} from 'react'
import {Redirect} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';

function Login({setShowLogin}){

    //USER
    const {rootState, loginUser,isLoggedIn} = useContext(UserContext);
    const {isAuth} = rootState;

    //STATES
    const initialState = {
        email:'',
        password:'',
    }

    const [userInfo,setUserInfo] = useState(initialState);
    const [error, setError] = useState(false);

    //FUNCTIONS

    // On change input value (email & password)
    const onChangeValue = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]:e.target.value
            }
        );
    }

    // On Submit Login From
    const submitForm = async (event) => {
        event.preventDefault();
        
        if(!userInfo.email){
            setError({ type: "email", message: 'Please fill in your email.' });
            return;
        }
        if(!userInfo.password){
            setError({type: "password", message: "Please fill in your password." });
            return;
        }
        setError(false);
        
        const data = await loginUser(userInfo);

        if(data.success && data.token){
            setUserInfo({...initialState});
            localStorage.setItem('loginToken', data.token);
            await isLoggedIn();
        }
        else{
            setError({
                type: data.message.type,
                message: data.message.message
            });
        }
    }


    if(!isAuth){

        return(
            <div className="panel-login">
                <h1 className="lobby">Login</h1>
                <form  id="login-form" onSubmit={submitForm} noValidate>
                
                    <div className="form-control">
                        <label htmlFor="email" >Email</label>
                        <input className="form-input" name="email" type="email" required placeholder="john.doe@hotmail.com" value={userInfo.email} onChange={onChangeValue} />
                        {error.type === "email" && 
                            <p className="error">{error.message}</p>
                        }
                    </div>
                
                    <div className="form-control">
                        <label htmlFor="password" >Password</label>
                        <input className="form-input" name="password" type="password" required placeholder="" value={userInfo.password} onChange={onChangeValue} autoComplete="on" />
                        {error.type === "password" && 
                            <p className="error">{error.message}</p>
                        }
                    </div>

                    <div className="form-control">
                        <button className="button primary" type="submit">Login</button>
                    </div>
                </form>
                <div className="below-form">
                    <span>Not registered yet?</span>
                    <button
                        className='lobbySwitchBtn link' 
                        onClick={() => setShowLogin(prevVal => !prevVal)}
                    >Signup</button>
                    {/* <span>or</span><button className="link" id="viewDemo" onClick={() => demoLogin()}>View a demo</button> */}
                </div>
                
            </div>
        );
    
    } else {
        return <Redirect to={'/dashboard'} />
    }
}

export default Login;