import React, {useState, useContext} from 'react'
import {Axios} from '../../Constants';
import {mutate} from 'swr';
import {v4 as uuid} from 'uuid';
import { MdSend } from 'react-icons/md';
import { ConvContext } from '../../contexts/ConvContext';
import { UserContext } from '../../contexts/UserContext';

function ConvForm({conv, size, data, messMutate, setMessEvent}) {

    //CONTEXTS
    const {convsdata, convsurl, groupdata, groupurl} = useContext(ConvContext);

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    const loginToken = localStorage.getItem('loginToken');
    Axios.defaults.headers.common['X-Authorization'] = 'bearer ' + loginToken;

    //STATES
    const [inputField, setInputField] = useState('');
    
    //FUNCTIONS

    //helper function for submitform -> this adds a message to either convsdata or groupdata
    function mutateAddMessageToConvs(data, url, timestamp){
        mutate(url, [...data.map(item => {
            if(item.id === conv.id){
                return {
                    ...item,
                    lastMessage: {
                        id: uuid(),
                        conv_id : conv.id, 
                        user_id: theUser.id, 
                        body: inputField, 
                        created_at: timestamp
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
            const timestamp = Math.floor(new Date().getTime() / 1000 );
            //MUTATE 1: First set cache of convlist items -> determine convs or groups with otherUser
            if(conv.otherUser){
                mutateAddMessageToConvs(convsdata, convsurl, timestamp);
            } else {
                mutateAddMessageToConvs(groupdata, groupurl, timestamp);
            }
            //MUTATE 2: Messages: PROBLEM: no url to mutate because of useSWRInfinite in Conversation.jsx!
            /* mutate(URL NODIG VANUIT CONVERSATION.JSX , [...data, {
                id: uuid(),
                conv_id : conv.id, 
                user_id: theUser.id, 
                body: inputField, 
                created_at: timestamp,
                received: false,
                //we don't know if timestamp/fullday will be true, can't set it here
            }], false); */
            //Insert into database
            const request = await Axios.post('/send-message.php', {
                conv_id : conv.id, 
                user_id: theUser.id, 
                body: inputField, 
                created_at: timestamp
            });
            if(request.status === 200){
                setInputField('');
                messMutate();
                conv.otherUser ? mutate(convsurl) : mutate(groupurl);
                /* socket.emit("message", {
                    user_id: theUser.id, 
                    body: inputField,
                    conv_id : conv.id,
                    datetime: datetime
                }); */
            }
        }
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
