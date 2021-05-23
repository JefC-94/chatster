import React, {useState, useEffect, useContext, createContext} from 'react';
import {UserContext} from '../contexts/UserContext';
import {ModalContext} from '../contexts/ModalContext';
import axios from 'axios';
import useSWR, {mutate} from 'swr';
import {v4 as uuid} from 'uuid';

export const ContactContext = createContext();

function ContactContextProvider(props) {
    
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    const {setSnackBar} = useContext(ModalContext);

    //SETUP CONTACT SWR CONNECTION

    const [contacts, setContacts] = useState({
        accepts: [],
        pendings: [],
        rejects: [],
        requests: []
    });

    const url = `/api/contacts/user_id=${theUser.id}`;

    const fetcher = url => axios.get(url).then(response => {
        if(response.data){
            return response.data;
        } else {
            return [];
        }
    });

    const {data, error} = useSWR(url, fetcher);

    //SETUP OTHER USERS SWR CONNECTION

    const usersurl = `/api/contacts/otherusers/user_id=${theUser.id}`;

    const usersFetcher = url => axios.get(url).then(response => response.data);

    const {data : usersdata, error: userserror} = useSWR(usersurl, usersFetcher);

    //Contact data gets divided over different categories

    useEffect(() => {
        if(data){
            getContacts();
        }
        return () => {
            clearContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    async function getContacts(){
        data.forEach(contact => {
            contact.otherUser = contact.user_1.id === theUser.id ? contact.user_2 : contact.user_1;
            if(contact.status === 2){
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
        let request = await axios(`/api/contacts/id=${id}&user_id=${theUser.id}`);
        const contact = request.data;
        contact.otherUser = contact.user_1.id === theUser.id ? contact.user_2 : contact.user_1;
        return contact;
    }

    // CRUD FUNCTIONS FOR ADDING, DELETING AND ACCEPTING/INVITING USERS

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
        } catch(error) {
            console.log(error.response.data.message);
        }
    }

    //SEND IMMEDIATELY ACCEPTED REQUEST -> FOR PREVIEW PURPOSES (only one or two contacts should have this option!)
    async function sendAcceptedRequest(user){
        const timestamp = Math.floor(new Date().getTime() / 1000 );
        const request = await axios.post(`/api/convs/user_id=${theUser.id}`, {
            name: null,
            created_at : timestamp,
            created_by : theUser.id,
            photo_url : null
        });
        if(request.status === 200){
            const conv_id = request.data;
            console.log(conv_id);
            //MUTATE CONTACTS
            mutate(url, [...data, 
                {
                    id: uuid(),
                    user_1: theUser,
                    user_2: user,
                    created_at: timestamp,
                    conv_id: conv_id,
                    status: 2 
                }
            ], false);
            //MUTATE USERS
            mutate(usersurl, [...usersdata.filter(useritem => useritem.id !== user.id)], false);
            const request2 = await axios.post(`/api/contacts/user_id=${theUser.id}`, {
                user_1: theUser.id,
                user_2: user.id,
                created_at: timestamp,
                conv_id: conv_id,
                status: 2
            });
            if(request2.status === 200){
                console.log("request sent and immediately accepted");
                mutate(url);
                mutate(usersurl);
                setSnackBar({open: true, message: 'Contact has been added'});
            }
        }
    }

    async function acceptRequest(id){
        const timestamp = Math.floor(new Date().getTime() / 1000 );
        const request = await axios.post(`/api/convs/user_id=${theUser.id}`, {
            name: null,
            created_at : timestamp,
            created_by : theUser.id,
            photo_url : null
        });
        if(request.status === 200){
            const conv_id = request.data;
            //FAKE: update local cache!
            mutate(url, [...data.map(contact => {
                if(contact.id === id){
                    return {
                        ...contact,
                        created_at : timestamp,
                        conv_id : conv_id,
                        status: 2 
                    }
                } else {
                    return contact;
                }
            })], false);
            //DB UPDATE
            const request2 = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
                created_at: timestamp,
                status: 2,
                conv_id: conv_id
            });
            if(request2.status === 200){
                mutate(url);
                setSnackBar({open: true, message: 'User added as contact'});
            }
        }
    }

    async function rejectRequest(id){
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
        const request = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
            status: 3
        });
        if(request.status === 200){
            console.log("request rejected");
            setSnackBar({open: true, message: 'User request has been blocked'});
            mutate(url);
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
        const request = await axios.delete(`/api/contacts/id=${id}&user_id=${theUser.id}`);
        if(request.data.message === 1){
            console.log("request cancelled");
            mutate(url);
            mutate(usersurl);
            setSnackBar({open: true, message: 'User invite has been cancelled'});
        }
    }
    
    async function deleteContact(id, conv_id, otherUser){
        //Mutate contacts
        mutate(url, [...data.filter(contact => contact.id !== id)], false);
        //Mutate users: same reason as above: don't do this!
        /* mutate(usersurl, [...usersdata, {
            username: otherUser.username,
            id: uuid()
        }], false); */
        //Request to db
        const request = await axios.delete(`/api/contacts/id=${id}&user_id=${theUser.id}`);
        const request2 = await axios.delete(`/api/convs/id=${conv_id}&user_id=${theUser.id}`);

        //after request is sent, check statuscode: example for david!
        /* if(request.status === 401){
            //he never does this part of the code!
            console.log(request.data.message);
        } */

        if(request.status === 200 && request2.status === 200){
            console.log("requests confirmed");
            mutate(usersurl);
            mutate(url);
            console.log("mutated");
            setSnackBar({open: true, message: 'Contact has been deleted'});
        }
    }

    // -> block = set status to 3 -> no reconnetion possible
    async function blockContact(id, conv_id){
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
        })], false)
        await axios.delete(`/api/convs/id=${conv_id}&user_id=${theUser.id}`);
        const request2 = await axios.put(`/api/contacts/id=${id}&user_id=${theUser.id}`, {
            status: 3,
            conv_id: null,
        });
        if(request2.status === 200){
            console.log("contact blocked");
            setSnackBar({open: true, message: 'Contact has been blocked'});
            mutate(url);
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