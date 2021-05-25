import React, {useState, useEffect, createContext} from "react";
import axios from 'axios';
import io from 'socket.io-client';

export const UserContext = createContext();

function UserContextProvider(props) {
    const [rootState, setRootState] = useState({isAuth:false,theUser:null})

    const [socket, setSocket] = useState();
    const [onlineUsers, setOnlineUsers] = useState([]);

    //Change PORT FOR PRODUCTION SERVER!!
    const newSocket = io('http://localhost:3000', { autoConnect: false });

    useEffect(() => {
        isLoggedIn();
    }, []);

    useEffect(() => {
        if(rootState.isAuth){
            console.log("connecting")
            let id = rootState.theUser.id;
            newSocket.auth = { id };
            newSocket.connect();
            setSocket(newSocket);
        }
        if(!rootState.isAuth){
            console.log("disconnecting")
            newSocket.close();
            setSocket();
        }
        return () => {
            newSocket.close();
            setSocket();
        }
    }, [rootState]);

    useEffect(() => {
        if(socket){
            socket.on('users', (users) => {
                //console.log('online users: ', users);
                setOnlineUsers(users);
            });
        }
    }, [socket]);

    const logoutUser = () => {
        localStorage.removeItem('loginToken');
        setRootState(prevValue => ({...prevValue, isAuth:false}))
    }

    const registerUser = async (user) => {
        const timestamp = Math.floor(new Date().getTime() / 1000 );
        const register = await axios.post('/api/auth/register', {
            username: user.username,
            email: user.email,
            password: user.password,
            created_at: timestamp
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
        const timestamp = Math.floor(new Date().getTime() / 1000 );
        const edit = await axios.put('/api/auth/edit', {
            id: user.id,
            username: user.username,
            oldPassword: user.oldPassword,
            newPassword: user.newPassword,
            updated_at: timestamp
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
            rootState,
            isLoggedIn,
            registerUser,
            loginUser,
            logoutUser,
            editUser,
            socket,
            onlineUsers
        }}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;
