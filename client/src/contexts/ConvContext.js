import React, {useState, useEffect, useContext, createContext} from 'react';
import useSWR, { mutate } from 'swr';
import {UserContext} from '../contexts/UserContext';
import {imgPath} from '../Constants';
import axios from 'axios';
import { ContactContext } from './ContactContext';
import profilepic from '../images/profile-blanc.svg';
import profilespic from '../images/profiles-blanc.svg';

export const ConvContext = createContext();

function ConvContextProvider(props) {
    
    //CONTEXTS
    const {rootState, onlineUsers, socket} = useContext(UserContext);
    const {theUser} = rootState;

    //Import contact-data: conversations should be re-rendered when contacts change!
    const {contactdata} = useContext(ContactContext);

    //STATE
    //Setup state to add individual conversations + group conversations
    const [convs, setConvs] = useState([]);
    //Setup state array for conversation ids that have received new messages
    const [unreadConvs, setUnreadConvs] = useState([]); // array of ids

    //SETUP SWR CONNECTION FOR INDIVIDUAL CONVS

    //const url = `/contact?join=conversation,contact,users&join=conversation,message&filter1=user_1,eq,${theUser.id}&filter2=user_2,eq,${theUser.id}&filter=status,eq,2`;
    const url = `/api/convs/user_id=${theUser.id}`;
    const fetcher = url => axios.get(url).then(response => response.data);
    const {data, error} = useSWR(url, fetcher); //DATA is the list of individual conversations

    
    //SETUP SWR CONNECTION FOR GROUP CONVS

    //const groupurl = `/user_conv?join=conversation,user_conv,users&join=conversation,message&filter1=user_id,eq,${theUser.id}`;
    const groupurl = `/api/groupconvs/user_id=${theUser.id}`;
    const groupfetcher = url => axios.get(url).then(response => response.data);
    const {data: groupdata, error: grouperror} = useSWR(groupurl, groupfetcher);


    //USE EFFECTS

    //When user (in contactModule) adds a user, this should update the data here as well
    useEffect(() => {
        mutate(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactdata]);

    //setup conversations when data updates -> cache & mutate
    //also, when onlineusers array changes -> check online status for every conversation
    useEffect(() => {
        if(data){
            getConvs();
        }
        if(groupdata){
            getGroupConvs();
        }
        return () => {
            setConvs([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, groupdata, onlineUsers]);


    //SOCKET EVENT LISTENER for new messages -> setup array of conv_ids
    useEffect(() => {
        socket.on('chat-message', (message) => {
            console.log("new message received");
            mutate(url);
            mutate(groupurl);
            //Todo: find a way that there are no doubles in this array!
            //IF STATEMENT NOT WORKING!!
            if(!unreadConvs.includes(message.conv_id)){
                setUnreadConvs(prevVal => [...prevVal, message.conv_id]);
            }
        });
        return () => socket.off('message');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        console.log(unreadConvs);
    }, [unreadConvs]);

    //Get all conversations, plus set lastMessage and otherUser + imageUrl as properties
    async function getConvs(){
        let conversations = [];
        data.forEach(conv => {
            conv.otherUser = conv.contact.user_1.id === theUser.id ? conv.contact.user_2 : conv.contact.user_1;
            conv.displayName = conv.otherUser.username;
            conv.imageUrl = conv.otherUser.photo_url ? `${imgPath}/${conv.otherUser.photo_url}` : profilepic;
            conv.online = onlineUsers.filter(onlineUser => onlineUser.user_id === conv.otherUser.id).length;
            conversations.push(conv);
        });
        setConvs(prevValue => ([
            ...prevValue, ...conversations
        ]));
    }

    //Get all group conversations, set userNames as string, displayName is conversation if there is one, also set lastMessage and imageUrl
    async function getGroupConvs(){
        let conversations = [];
        groupdata.forEach(conv => {
            conv.userNames = conv.user_conv //first get current user out of this array, afterwards map together to a set of spans
                .filter(user_conv => user_conv.user_id.id !== theUser.id)
                .map((user_conv, index, array) => <span key={user_conv.user_id.id}>{user_conv.user_id.username + (index < array.length-1 ? ', ' : '')}</span>);
            conv.displayName = conv.name ? conv.name : conv.userNames;
            conv.imageUrl = conv.photo_url ? `${imgPath}/${conv.photo_url}` : profilespic;
            conversations.push(conv);
        });
        setConvs(prevValue => ([
            ...prevValue, ...conversations
        ]));
    }

    async function getSingleConv(id){
        try {
            const request = await axios.get(`/api/convs/id=${id}&user_id=${theUser.id}`);
            const conv = request.data;
            conv.otherUser = conv.contact.user_1.id === theUser.id ? conv.contact.user_2 : conv.contact.user_1;
            conv.displayName = conv.otherUser.username;
            conv.imageUrl = conv.otherUser.photo_url ? `${imgPath}/${conv.otherUser.photo_url}` : profilepic;
            return conv;
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    return (
        <ConvContext.Provider value={{
            convserror: error,
            grouperror: grouperror,
            convsdata: data,
            groupdata: groupdata,
            convsurl: url,
            groupurl: groupurl,
            convs,
            setConvs,
            getSingleConv,
            unreadConvs,
            setUnreadConvs
        }}>
            {props.children}
        </ConvContext.Provider>
    )
}

export default ConvContextProvider
