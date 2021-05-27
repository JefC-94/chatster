import React, {useState, useContext} from 'react'
import axios from 'axios';
import {mutate} from 'swr';
import {v4 as uuid} from 'uuid';
import { MdSend } from 'react-icons/md';
import { ConvContext } from '../../contexts/ConvContext';
import { UserContext } from '../../contexts/UserContext';
import {now} from '../helpers/TimeSince';

function ConvForm({conv, size, data, messMutate, setMessEvent}) {

    //CONTEXTS
    const {convsdata, convsurl, groupdata, groupurl} = useContext(ConvContext);
    const {socket} = useContext(UserContext);

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    //STATES
    const [inputField, setInputField] = useState('');
    
    //FUNCTIONS

    //helper function for submitform -> this adds a message to either convsdata or groupdata
    function mutateAddMessageToConvs(data, url){
        mutate(url, [...data.map(item => {
            if(item.id === conv.id){
                return {
                    ...item,
                    lastMessage: {
                        id: uuid(),
                        conv_id : conv.id, 
                        user_id: theUser.id, 
                        body: inputField, 
                        created_at: now()
                    },
                }
            } else {
                return item;
            }
        })], false);
    }


    //FORM SUBMIT FUNCTION
    async function handleFormSubmit(){
        if(inputField){
            //MUTATE 1: First set cache of convlist items -> determine convs or groups with otherUser
            if(conv.otherUser){
                mutateAddMessageToConvs(convsdata, convsurl);
            } else {
                mutateAddMessageToConvs(groupdata, groupurl);
            }
            //MUTATE 2: Messages: PROBLEM: no url to mutate because of useSWRInfinite in Conversation.jsx!
            /* mutate(URL NODIG VANUIT CONVERSATION.JSX , [...data, {
                id: uuid(),
                conv_id : conv.id, 
                user_id: theUser.id, 
                body: inputField, 
                created_at: now(),
                received: false,
                //we don't know if timestamp/fullday will be true, can't set it here
            }], false); */
            //Insert into database
            try {
                const request = await axios.post(`/api/messages/user_id=${theUser.id}`, {
                    conv_id : conv.id, 
                    user_id: theUser.id, 
                    body: inputField, 
                    created_at: now()
                });
                console.log(request.data.message);
                
                //Update form and messages
                setInputField('');
                messMutate();

                //Update the convitems on the side as well
                conv.otherUser ? mutate(convsurl) : mutate(groupurl);
                
                //Emit message event to socket
                conv.otherUser ? emitMessageToContact() : emitMessageToGroup();
                
                //Update contact -> add unread message for the other user
                conv.otherUser ? setUnreadMessage() : setUnreadGroupMessage();

            } catch(error){
                console.log(error.response.data.message);
            }
        }
    }

    //HANDLER FUNCTIONS IN FORM SUBMIT (AFTER DB INSERTION)

    function emitMessageToContact(){
        socket.emit("chat-message", {
            to_id: conv.otherUser.id, //to immediatily get right user on server
            body: inputField,
            conv_id : conv.id,
            datetime: now()
        })
    }

    function emitMessageToGroup(){
        socket.emit("group-message", { 
            body: inputField,
            conv_id : conv.id,
            datetime: now()
        });
    }

    async function setUnreadMessage(){
        try{
            const request = await axios.get(`/api/contacts/updateunread/id=${conv.contact.id}&to_id=${conv.otherUser.id}&user_id=${theUser.id}`);
            console.log(request.data.message);
        } catch(error){
            console.log(error);
        }
    }

    async function setUnreadGroupMessage(){
        //
    }


    return (
        <div className="message-form-wrap">
            <form id="message-form" onSubmit={(e) => {
                setMessEvent("newmessage");
                e.preventDefault();
                handleFormSubmit();
            }}>
                <input type="text" id="message-field" placeholder="Type your message..." value={inputField} onChange={(e) => {setInputField(e.target.value)}}/>
                <button className="primary" type="submit"><MdSend size={18} /></button>
            </form>
        </div>
    )
}

export default ConvForm
