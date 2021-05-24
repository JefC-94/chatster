import React, {useState, useContext, useEffect, useRef} from 'react'
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import {WindowContext} from '../../contexts/WindowContext';
import {ConvContext} from '../../contexts/ConvContext';
import {ModalContext} from '../../contexts/ModalContext';
import {SocketContext} from '../../contexts/SocketContext';
import Message from './Message';
import ConvForm from './ConvForm';
import axios from 'axios';
import {useSWRInfinite, mutate} from 'swr';
import { FaChevronLeft } from 'react-icons/fa';

function Conversation({conv, setCurrentConv, getCurrentConv, basePath}) {

    //CONTEXTS
    const {windowWidth} = useContext(WindowContext);
    const {groupurl} = useContext(ConvContext);

    const {setSnackBar} = useContext(ModalContext);

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    //REFS
    const messagesRef = useRef();

    //USE SWR INFINITE
    //Get a paginated set of messages, with load more functionality
    const fetcher = url => axios.get(url).then(response => {
        //console.log(url)
        return response.data
    });
        
    const {data, mutate: messMutate , size, setSize, error} = useSWRInfinite(
        //index => `/message?join=users&filter=conv_id,eq,${conv.id}&order=created_at,desc&page=${index + 1},20`,
        //index => `messages.php?conv_id=${conv.id}&user_id=${theUser.id}&page=${index + 1}&per_page=20`,
        index => `/api/messages/conv_id=${conv.id}&user_id=${theUser.id}&page=${index + 1}&per_page=20`,
        fetcher
    );

    //STATES
    const [messages, setMessages] = useState([]);
    const [alteredMessages, setAlteredMessages] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [messHeight, setMessHeight] = useState();
    const [messEvent, setMessEvent] = useState("firstrender");

    //USE EFFECTS

    useEffect(() => {
        //console.log(messEvent);

        //ONLY SCROLL TO BOTTOM ON FIRST RENDER (when just one array gets fetched)
        if(messEvent === "firstrender" || messEvent === "newmessage"){
            scrollToBottom();
            //console.log("scrolled to bottom");
        }
        
        //KEEP SCROLL LEVEL ON RENDERS WHEN USER CLICKED THE BUTTON: total height of new div - previous height - constant value
        if(messEvent === "loadmore"){
            setMessHeight(messagesRef.current.scrollHeight);
            //Here we make use of the delay on setMessHeight: the messHeight below is the previous value
            messagesRef.current.scroll({top: (messagesRef.current.scrollHeight - messHeight - 100)});    
        }        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messEvent, alteredMessages]);

    //add the different arrays/pages of data into the messages array + set Total Count!
    useEffect(() => {
        if(data){
            setMessages(data.reduce((acc, val) => acc.concat(val.records), []));
            data[0].results ? setTotalCount(data[0].results) : setTotalCount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    //when messages is updated, update the alteredMessages + check if there actually are messages
    useEffect(() => {
        if(messages.length){
            //STILL AN ERROR ON SET ENDBLOCK ON UNDEFINED!!
            setPropertiesForMessages();
        } else {
            setAlteredMessages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    //When user changes conversation, set messEvent back to firstrender!
    useEffect(() => {
        setMessEvent("firstrender");
    }, [conv]);


    //FUNCTIONS

    function loadMore(){
        setSize(size + 1);
        console.log(size);
    }

    function scrollToBottom(){
        messagesRef.current.scroll({top: messagesRef.current.scrollHeight});
    }

    function setPropertiesForMessages(){
        setAlteredMessages([...messages.map((message, index, messages) => {
            let prevDif = 0;
            let nextDif = 0;
            message.fullDay = message.startBlock = message.endBlock = false;
            message.received = message.user_id.id !== theUser.id;

            //Show first timestamp by default, and in fullday
            if(index === 0 && message.received){
                message.endBlock = true;
            }

            if(index < messages.length-1){
                //Determine if this is the first message on the current day, and if so > make sure we show the date
                const today = new Date().getDate();
                if(new Date(message.created_at * 1000).getDate() === today && new Date(messages[index+1].created_at * 1000).getDate() !== today){
                    message.fullDay = true;
                }

                //Determine difference in seconds of previous message and this message > startblock
                prevDif = (message.created_at - messages[index+1].created_at);
                if(prevDif > 300){
                    message.startBlock = true;
                    message.setName = message.received;
                }

                //if the previous message was from another user and this message is not from this user, setName to true
                if(messages[index+1].user_id.id !== message.user_id.id && message.received){
                    message.setName = true;
                }
            }
                        
            //Determine difference in seconds of next message and this message > endblock
            if(index > 0){
                nextDif = (messages[index-1].created_at - message.created_at);
                if(nextDif > 300 || messages[index-1].user_id.id !== message.user_id.id){
                    message.endBlock= message.user_id.id !== theUser.id;
                }
            }

            //If this is the last message and it's by the other user -> endBlock
            if(index === messages.length-1){
                message.startBlock = true;
                message.setName = message.received;
                message.fullDay = true;
            }
            
            return message;
        })]);
    }

    const socket = useContext(SocketContext);
    useEffect(() => {
        if(socket === null){
            return;
        }
        socket.on('chat-message', addMessageToConv);
        return () => socket.off('message');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    function addMessageToConv(data){   
        if(data.conv_id === conv.id && data.user_id !== theUser.id){
            console.log("new message");
            messMutate();
        }
    }

    //FUNCTIE VERPLAATSEN NAAR CONVCONTEXT?
    async function deleteUserFromGroup(){
        //aanpassen dat een user altijd een groep kan verlaten -> conversatie verwijdert zich als er maar twee over zijn?
        //if(conv.user_conv.length > 3){
            const user_conv_id = conv.user_conv.filter(user_conv => user_conv.user_id.id === theUser.id)[0];
            console.log(user_conv_id.id);
            const request = await axios.delete(`/api/userconvs/id=${user_conv_id.id}&user_id=${theUser.id}`);
            console.log(request.data.message);
            if(request.status === 200){
                mutate(groupurl);
                setCurrentConv();
                setSnackBar({open: true, message: 'You have left the group chat'});
            }
        //}
    }

    return (
        <>
        
        <div className="conv-info">
            {conv && 
            <>
            <div className="conv-info-profile">
                {windowWidth < 800 &&
                    <button className="link flex" onClick={() => setCurrentConv()}><FaChevronLeft size={18} /></button>
                }
                <img src={conv.imageUrl} alt="profile" />
                <div className="conv-names">
                    <h2>{conv.displayName}</h2>
                    {(!conv.otherUser && conv.displayName !== conv.userNames) && <p>You, {conv.userNames}</p>}
                </div>
            </div>

            {conv.otherUser ? 
                <Link className="button primary" to={`/${basePath}/contacts/${conv.contact.id}`}>View profile</Link>
                :
                (conv.created_by === theUser.id ? 
                    <Link className="button primary" to={`/${basePath}/group/${conv.id}/update`}>Edit group chat</Link>
                    :
                    <button className="button primary" onClick={() => deleteUserFromGroup()}>Leave group</button>
                )            
            }
            </>
            }
        </div>

        <div ref={messagesRef} className="conv-messages-list">
            {messages.length !== totalCount && 
                <button id="loadmore" className="secondary center" onClick={() => {
                    setMessEvent("loadmore");
                    loadMore();
                }}>Load more</button>
            }
            <div className="scrollable-list">
                {alteredMessages.sort((a, b) => (a.created_at - b.created_at)).map(message => {
                    return <Message key={message.id} message={message} conv={conv} />
                })
                }
            </div>
            {error && <div className="error-message">Oops... something went wrong! Please try again later.</div>}
        </div>

        <ConvForm conv={conv} data={data} size={size} messMutate={messMutate} setMessEvent={setMessEvent} />

        </>
    )
}

export default Conversation;