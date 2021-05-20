import React, {useState, useEffect, createContext} from "react";
import axios from 'axios';

export const UserContext = createContext();

function UserContextProvider(props) {
    const [rootState, setRootState] = useState({isAuth:false,theUser:null})

    useEffect(() => {
        isLoggedIn();
    }, []);

    const logoutUser = () => {
        localStorage.removeItem('loginToken');
        setRootState(prevValue => ({...prevValue, isAuth:false}))
    }

    const registerUser = async (user) => {
        const register = await axios.post('/api/auth/register', {
            username: user.username,
            email: user.email,
            password: user.password
        });
        
        return register.data;
    }

    const loginUser = async (user) => {
        const login = await axios.post('/api/auth/login', {
            email: user.email,
            password: user.password
        });
        console.log(login.data);
        return login.data;
    }

    const editUser = async (user) => {
        const edit = await axios.put('/api/auth/edit', {
            id: user.id,
            username: user.username,
            oldPassword: user.oldPassword,
            newPassword: user.newPassword
        });
        return edit.data;
    }

    const isLoggedIn = async () => {
        const loginToken = localStorage.getItem('loginToken');

        if(loginToken){

            //Adding JWT token to axios default header
            axios.defaults.headers.common['x-access-token'] = loginToken;

            const {data} = await axios.get('/api/auth/me');

            console.log(data);

            if(data.user){
                setRootState(prevValue => ({...prevValue, isAuth:true,theUser:data.user}));
            }
        }
    }

    return (
        <UserContext.Provider value={{
            rootState : rootState,
            isLoggedIn : isLoggedIn,
            registerUser: registerUser,
            loginUser: loginUser,
            logoutUser: logoutUser,
            editUser: editUser
        }}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;
