import React, {useContext,useState} from 'react';
import {Redirect} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';

function Register({setShowLogin}){
    
    //USER
    const {rootState, registerUser, loginUser, isLoggedIn} = useContext(UserContext);
    const {isAuth} = rootState;

    //STATES
    const initialState = {
        username:'',
        email:'',
        password:''
    }

    const [userInfo,setUserInfo] = useState(initialState);
    const [error, setError] = useState(false); // Error has type and message properties for placement

    //FUNCTIONS

    // On Submit the Registration Form
    const submitForm = async (event) => {
        event.preventDefault();
        if(!userInfo.username){
            setError({
                type: "username",
                message:'Whoops! Please fill in a username.'
            });
            return;
        }
        if(!userInfo.email){
            setError({
                type: "email",
                message: 'Please fill in an email.'
            });
            return;
        }
        if(!userInfo.password){
            setError({
                type: "password",
                message: "Please fill in a password."
            });
            return;
        }
        setError(false);
        const data = await registerUser(userInfo);
        if(data.success){
            //setUserInfo({...initialState});
            console.log(data.message);
            const login = await loginUser(userInfo);
            if(login.success && login.token){
                //setUserInfo({...initialState});
                localStorage.setItem('loginToken', login.token);
                await isLoggedIn();
            }
        }
        else{
            setError({
                type: JSON.parse(data.message).type,
                message: JSON.parse(data.message).message
            });
            console.log(data);
        }
    }

    // On change the Input Value (name, email, password)
    const onChangeValue = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]:e.target.value
            }
        );
    }
    
    if(!isAuth){
        return(
            <div className="panel-register">
                <h1 className="lobby">Sign Up</h1>
                
                <form id="register-form" onSubmit={submitForm} noValidate>
                    
                    <div className="form-control">
                        <label htmlFor="username">Name</label>
                        <input className="form-input" name="username" required type="text" value={userInfo.username} onChange={onChangeValue} placeholder="John Doe"/>
                        {error.type === "username" && 
                            <p className="error">{error.message}</p>
                        }
                    </div>
                    
                    <div className="form-control">
                        <label htmlFor="email">Email</label>
                        <input className="form-input" name="email" required type="email" value={userInfo.email} onChange={onChangeValue} placeholder="john.doe@hotmail.com"/>
                        {error.type === "email" && 
                            <p className="error">{error.message}</p>
                        }
                    </div>

                    <div className="form-control">
                        <label htmlFor="password">Password</label>
                        <input className="form-input" name="password" required type="password" value={userInfo.password} onChange={onChangeValue} placeholder="" />
                        {error.type === "password" && 
                            <p className="error">{error.message}</p>
                        }
                    </div>

                    <div className="form-control">
                        <button className="button primary" type="submit">Sign Up</button>
                    </div>
                </form>

                <div className="below-form">
                    <span>Already an account?</span>
                    <button 
                        className='lobbySwitchBtn link' 
                        onClick={() => setShowLogin(prevVal => !prevVal)}
                    >Login</button>
                </div>
                
            </div>
        );
    } else {
        return <Redirect to='/dashboard' />
    }
}

export default Register
