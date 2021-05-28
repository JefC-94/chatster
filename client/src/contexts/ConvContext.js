import React, {useState, useEffect, useContext, createContext, useRef} from 'react';
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

    //STATES

    //Setup state to add individual conversations + group conversations
    const [convs, setConvs] = useState([]);
    const [loading, setLoading] = useState({single: false, group: false});

    //this is the current active conversation, defined here but mainly set in conversations.jsx: it can be set by id as well as click function on convItems
    const [currentConv, setCurrentConv] = useState();

    //Setup a reference to the currentConv to use in the socket event handler
    const currentConvRef = useRef(currentConv);
    useEffect(() => {currentConvRef.current = currentConv});


    //SETUP SWR CONNECTION FOR INDIVIDUAL CONVS

    //const url = `/contact?join=conversation,contact,users&join=conversation,message&filter1=user_1,eq,${theUser.id}&filter2=user_2,eq,${theUser.id}&filter=status,eq,2`;
    const url = `/api/convs/user_id=${theUser.id}`;
    const fetcher = url => axios.get(url).then(response => response.data);
    const {data} = useSWR(url, fetcher); //DATA is the list of individual conversations

    
    //SETUP SWR CONNECTION FOR GROUP CONVS

    //const groupurl = `/user_conv?join=conversation,user_conv,users&join=conversation,message&filter1=user_id,eq,${theUser.id}`;
    const groupurl = `/api/groupconvs/user_id=${theUser.id}`;
    const groupfetcher = url => axios.get(url).then(response => response.data);
    const {data: groupdata} = useSWR(groupurl, groupfetcher);


    //USE EFFECTS

    //When user (in contactModule) adds a user, this should update the data here as well
    useEffect(() => {
        mutate(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactdata]);

    //setup conversations when data updates -> cache & mutate
    //also, when onlineusers array changes -> check online status for every conversation
    useEffect(() => {
        setLoading({single: true, group: true});
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

    
    //SOCKET EVENT LISTENER for New Messages -> Update CONVITEMS!
    useEffect(() => {
        //Pass currentConvRef to the handler function for synchronisation (otherwise always undefined)
        const handler = (message) => {updateUnreads(message, currentConvRef.current)}
        socket.on('chat-message', handler);
        return () => {
            socket.off('chat-message', handler);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //SOCKET MESSAGE RECEIVE HANDLER
    //Pass currentConv as Refs (current)
    //If conv is currentConv -> immediately read it!
    async function updateUnreads(message, currentConv){
        console.log("message handler executed");
        if(currentConv){
            if(currentConv.id === message.conv_id){
                //The new message is added to the current conversation -> Set unread of this contact user immediately to zero!
                const request = await axios.get(`/api/contacts/conv_id=${message.conv_id}&user_id=${theUser.id}`)
                const contact_id = request.data;
                readUnreadContact(contact_id.id);
                mutate(url);
                mutate(groupurl);
            } else {
                mutate(url);
                mutate(groupurl);
            }
        } else {
            mutate(url);
            mutate(groupurl);
        }
    }


    //GET FUNCTIONS

    //Get all conversations, plus set lastMessage and otherUser + imageUrl as properties
    async function getConvs(){
        console.log("getConvs runs");
        data.forEach(conv => {
            conv.otherUser = conv.contact.user_1.id === theUser.id ? conv.contact.user_2 : conv.contact.user_1;
            conv.displayName = conv.otherUser.username;
            conv.imageUrl = conv.otherUser.photo_url ? `${imgPath}/${conv.otherUser.photo_url}` : profilepic;
            conv.online = onlineUsers.filter(onlineUser => onlineUser.user_id === conv.otherUser.id).length;
            conv.unread = conv.contact.user_1.id === theUser.id ? conv.contact.user1_unread : conv.contact.user2_unread;
            setConvs(prevValue => ([
                ...prevValue, conv
            ]));
        });
        setLoading(prevVal => ({...prevVal, single: false}));
    }

    //Get all group conversations, set userNames as string, displayName is conversation if there is one, also set lastMessage and imageUrl
    async function getGroupConvs(){
        groupdata.forEach(conv => {
            conv.userNames = conv.user_conv //first get current user out of this array, afterwards map together to a set of spans
                .filter(user_conv => user_conv.user_id.id !== theUser.id)
                .map((user_conv, index, array) => <span key={user_conv.user_id.id}>{user_conv.user_id.username + (index < array.length-1 ? ', ' : '')}</span>);
            conv.displayName = conv.name ? conv.name : conv.userNames;
            conv.imageUrl = conv.photo_url ? `${imgPath}/${conv.photo_url}` : profilespic;
            setConvs(prevValue => ([
                ...prevValue, conv
            ]));
        });
        setLoading(prevVal => ({...prevVal, group: false}));
    }

    async function getSingleConv(id){
        try {
            const request = await axios.get(`/api/convs/id=${id}&user_id=${theUser.id}`);
            const conv = request.data;
            conv.otherUser = conv.contact.user_1.id === theUser.id ? conv.contact.user_2 : conv.contact.user_1;
            conv.displayName = conv.otherUser.username;
            conv.imageUrl = conv.otherUser.photo_url ? `${imgPath}/${conv.otherUser.photo_url}` : profilepic;
            conv.online = onlineUsers.filter(onlineUser => onlineUser.user_id === conv.otherUser.id).length;
            conv.unread = conv.contact.user_1.id === theUser.id ? conv.contact.user1_unread : conv.contact.user2_unread;
            return conv;
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    async function readUnreadContact(contact_id){
        try {
            const request2 = await axios.get(`/api/contacts/readunread/id=${contact_id}&to_id=${theUser.id}&user_id=${theUser.id}`);
            console.log(request2.data.message);
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    return (
        <ConvContext.Provider value={{
            convsdata: data,
            groupdata: groupdata,
            convsurl: url,
            groupurl: groupurl,
            loading,
            convs,
            setConvs,
            getSingleConv,
            currentConv,
            setCurrentConv,
            readUnreadContact
        }}>
            {props.children}
        </ConvContext.Provider>
    )
}

export default ConvContextProvider
