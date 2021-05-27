import React, {useState, useEffect, useContext, createContext} from 'react';
import {UserContext} from '../contexts/UserContext';
import {ModalContext} from '../contexts/ModalContext';
import axios from 'axios';
import useSWR, {mutate} from 'swr';
import {v4 as uuid} from 'uuid';
import {now} from '../components/helpers/TimeSince';

export const ContactContext = createContext();

function ContactContextProvider(props) {
    
    //CONTEXTS
    const {rootState, onlineUsers, socket} = useContext(UserContext);
    const {theUser} = rootState;
    const {setSnackBar} = useContext(ModalContext);

    //STATES
    const [contacts, setContacts] = useState({
        accepts: [],
        pendings: [],
        rejects: [],
        requests: []
    });

    //SETUP CONTACT SWR CONNECTION
    const url = `/api/contacts/user_id=${theUser.id}`;
    const fetcher = url => axios.get(url).then(response => response.data);
    const {data, error} = useSWR(url, fetcher);

    //SETUP OTHER USERS SWR CONNECTION
    const usersurl = `/api/contacts/otherusers/user_id=${theUser.id}`;
    const usersFetcher = url => axios.get(url).then(response => response.data);
    const {data : usersdata, error: userserror} = useSWR(usersurl, usersFetcher);


    //USE EFFECTS

    //When contact data changes, update contacts + also when onlineusers array changes
    useEffect(() => {
        if(data){
            getContacts();
        }
        return () => {
            clearContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, onlineUsers]);

    //Update contacts and otherUsers when the socket receives a contact-update event
    //If data.message is null, the event is delete/block/reject, so we don't show a message
    useEffect(() => {
        const handler = (data) => {updateContacts(data);}
        if(data){
            socket.on('contact-update', handler);
        }
        return () => socket.off('contact-update', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, socket])


    function updateContacts(data){
        if(data.message){
            setSnackBar({open: true, message: data.message});
        }
        mutate(url);
        mutate(usersurl);
    }

    //FUNCTIONS FOR GETTING CONTACTS

    async function getContacts(){
        console.log("getContacts runs");
        //Contact data gets divided over different categories
        data.forEach(contact => {
            contact.otherUser = contact.user_1.id === theUser.id ? contact.user_2 : contact.user_1;
            if(contact.status === 2){
                contact.online = onlineUsers.filter(onlineUser => onlineUser.user_id === contact.otherUser.id).length;
                setContacts(prevValue => ({
                    ...prevValue, accepts: [...prevValue.accepts, contact]
                }));
            }
            if(contact.status === 1){
                if(contact.user_1.id === theUser.id){
                    //user has made this request -> pending
                    setContacts(prevValue => ({
                        ...prevValue, pendings: [...prevValue.pendings, contact]
                    }));
                } else {
                    //user has received this request -> has to accept
                    setContacts(prevValue => ({
                        ...prevValue, requests: [...prevValue.requests, contact]
                    }));
                }
            }
            if(contact.status === 3){
                setContacts(prevValue => ({
                    ...prevValue, rejects: [...prevValue.rejects, contact]
                }));
            }
        });
    }

    function clearContacts(){
        setContacts({
            accepts: [],
            pendings: [],
            rejects: [],
            requests: []
        });
    }

    async function getSingleContact(id){
        try {
            let request = await axios(`/api/contacts/id=${id}&user_id=${theUser.id}`);
            const contact = request.data;
            contact.otherUser = contact.user_1.id === theUser.id ? contact.user_2 : contact.user_1;
            return contact;
        } catch(error){
            console.log(error.response.data.message)
        }
    }

    // CRUD FUNCTIONS FOR ADDING, DELETING AND ACCEPTING/INVITING CONTACTS AND CONVERSATIONS

    async function sendRequest(user){ // need user_id + username for cache
        //MUTATE PENDINGS
        mutate(url, [...data, 
        {
            id: uuid(),
            user_1: theUser,
            user_2: user,
            created_at: null,
            conv_id: null,
            status: 1 
        }
        ], false);
        //MUTATE USERS
        mutate(usersurl, [...usersdata.filter(useritem => useritem.id !== user.id)], false);
        //SEND DATABASE REQUEST
        //New style of request handling: try and catch block!!
        try{
            const request = await axios.post(`/api/contacts/user_id=${theUser.id}`, {
                user_1: theUser.id,
                user_2: user.id,
                created_at: null,
                conv_id: null,
                status: 1
            });
            console.log(request.data.message); // ID of new contact
            console.log('request sent');
            mutate(url);
            mutate(usersurl);
            setSnackBar({open: true, message: 'Request has been sent'});
            socket.emit("contact-update", { 
                to_id: user.id,
                action: `${theUser.username} has sent you an invite`
            });
        } catch(error) {
            console.log(error.response.data.message);
        }
    }

    //SEND IMMEDIATELY ACCEPTED REQUEST -> FOR PREVIEW PURPOSES (only one or two contacts should have this option!)
    async function sendAcceptedRequest(user){
        try {
            //POST CONVERSATION AND RETURN NEW ID
            const request = await axios.post(`/api/convs/user_id=${theUser.id}`, {
                name: null,
                created_at : now(),
                created_by : theUser.id,
                photo_url : null
            });
            const conv_id = request.data.message;
            console.log(conv_id);
            // Now MUTATE CONTACTS
            mutate(url, [...data, 
                {
                    id: uuid(),
                    user_1: theUser,
                    user_2: user,
                    created_at: now(),
                    conv_id: conv_id,
                    status: 2 
                }
            ], false);
            //MUTATE USERS
            mutate(usersurl, [...usersdata.filter(useritem => useritem.id !== user.id)], false);
            //CONTACT CREATION IN DATABASE
            try {
                const request2 = await axios.post(`/api/contacts/user_id=${theUser.id}`, {
                    user_1: theUser.id,
                    user_2: user.id,
                    created_at: now(),
                    conv_id: conv_id,
                    status: 2
                });
                console.log(request2.data.message);
                mutate(url);
                mutate(usersurl);
                setSnackBar({open: true, message: 'Contact has been added'});
                socket.emit("contact-update", { 
                    to_id: user.id,
                    action: `${theUser.username} has added you as a contact`
                });
            } catch(error){
                console.log(error.response.data.message);
            }
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    async function acceptRequest(id, otherUser){
        try{
            //Create CONV and return ID
            const request = await axios.post(`/api/convs/user_id=${theUser.id}`, {
                name: null,
                created_at : now(),
                created_by : theUser.id,
                photo_url : null
            });
            const conv_id = request.data.message;
            //FAKE: update local cache!
            mutate(url, [...data.map(contact => {
                if(contact.id === id){
                    return {
                        ...contact,
                        created_at : now(),
                        conv_id : conv_id,
                        status: 2 
                    }
                } else {
                    return contact;
                }
            })], false);
            //CHANGE CONTACT STATUS IN DB
            try {
                const request2 = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
                    created_at: now(),
                    status: 2,
                    conv_id: conv_id
                });
                console.log(request2.data.message);
                mutate(url);
                setSnackBar({open: true, message: 'User added as contact'});
                socket.emit("contact-update", { 
                    to_id: otherUser.id,
                    action: `${theUser.username} has accepted your invite`
                });
            } catch(error){
                console.log(error.response.data.message)
            }
        } catch(error){
            console.log(error.response.data.message)
        }
    }

    async function rejectRequest(id, otherUser){
        mutate(url, [...data.map(contact => {
            if(contact.id === id){
                return {
                    ...contact,
                    status: 3,
                    conv_id: null
                }
            } else {
                return contact;
            }
        })], false);
        try {
            const request = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
                status: 3,
                conv_id: null
            });
            console.log(request.data.message);
            setSnackBar({open: true, message: 'User request has been blocked'});
            mutate(url);
            socket.emit("contact-update", { 
                to_id: otherUser.id,
                action: null
            });
        } catch(error){
            console.log(error.response.data.message)
        }
    }

    async function cancelRequest(id, otherUser){
        //Mutate requests
        mutate(url, [...data.filter(contact => contact.id !== id)], false);
        //Mutate users -> for now don't do this. element gets added at end of array and flashes to right position
        /* mutate(usersurl, [...usersdata, {
            username: otherUser.username, 
            id: otherUser.id
            }
        ], false) */
        //Request to db
        try {
            const request = await axios.delete(`/api/contacts/id=${id}&user_id=${theUser.id}`);
            console.log(request.data.message);
            mutate(url);
            mutate(usersurl);
            setSnackBar({open: true, message: 'User invite has been cancelled'});
            socket.emit("contact-update", { 
                to_id: otherUser.id,
                action: null
            });
        } catch(error){
            console.log(error.response.data.message);
        }
    }
    
    async function deleteContact(id, conv_id, otherUser){
        //Mutate contacts
        //ERROR: the mutate function here deletes the contact from the data, and
        //for some reason in the end the getConvs() function calls the deleted conv_id with no contact_id
        //mutate(url, [...data.filter(contact => contact.id !== id)], false);
        
        //Mutate users: don't do this, elements get added to bottom of array and then jump
        /* mutate(usersurl, [...usersdata, {
            username: otherUser.username,
            id: uuid()
        }], false); */
        
        //Request to db
        try {
            const request = await axios.delete(`/api/convs/id=${conv_id}&user_id=${theUser.id}`);
            console.log(request.data.message);
            try {
                const request2 = await axios.delete(`/api/contacts/id=${id}&user_id=${theUser.id}`);
                console.log(request2.data.message);
                mutate(url);
                mutate(usersurl);
                setSnackBar({open: true, message: 'Contact has been deleted'});
                socket.emit("contact-update", { 
                    to_id: otherUser.id,
                    action: null
                });
            } catch(error){
                console.log(error.response.data.message);
            }
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    async function blockContact(id, conv_id, otherUser){
        /* mutate(url, [...data.map(contact => {
            if(contact.id === id){
                return {
                    ...contact,
                    status: 3,
                    conv_id: null
                }
            } else {
                return contact;
            }
        })], false); */
        //API Requests
        try {
            const request = await axios.delete(`/api/convs/id=${conv_id}&user_id=${theUser.id}`);
            console.log(request.data.message);
            try {
                const request2 = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
                    status: 3,
                    conv_id: null,
                });
                console.log(request2.data.message);
                setSnackBar({open: true, message: 'Contact has been blocked'});
                mutate(url);
                socket.emit("contact-update", { 
                    to_id: otherUser.id,
                    action: null
                });
            } catch(error){
                console.log(error.response.data.message);
            }
        } catch(error){
            console.log(error.response.data.message);
        }
    }

    return (
        <ContactContext.Provider value={{
            contactdata: data,
            contacturl: url,
            error,
            contacts,
            users: usersdata,
            userserror: userserror,
            getSingleContact,
            acceptRequest,
            rejectRequest,
            deleteContact,
            blockContact,
            sendRequest,
            sendAcceptedRequest,
            cancelRequest
        }}>
            {props.children}
        </ContactContext.Provider>
    )
}

export default ContactContextProvider;