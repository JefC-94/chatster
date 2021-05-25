import React, {useState, useEffect, createContext} from "react";
import axios from 'axios';
import io from 'socket.io-client';

export const UserContext = createContext();

function UserContextProvider(props) {
    const [rootState, setRootState] = useState({isAuth:false,theUser:null})

    const [socket, setSocket] = useState();
    const [onlineUsers, setOnlineUsers] = useState([]);

    //Setup Socket Client
    const HOST = window.location.origin.replace(/^http/, 'ws');
    const newSocket = io(HOST, { autoConnect: false });

    useEffect(() => {
        isLoggedIn();
    }, []);

    //Connect to socket when user logs in, disconnect when user logs out
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rootState]);

    //Listen to socket event for other users going online and offline
    useEffect(() => {
        if(socket){
            socket.on('users', (users) => {
                //console.log('online users: ', users);
                setOnlineUsers(users);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            //console.log(data); //logs current logged in user

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
