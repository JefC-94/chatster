import React, {useEffect, useContext} from 'react';
import {useParams, Link} from 'react-router-dom';
import {ConvContext} from '../../contexts/ConvContext';
import { UserContext } from '../../contexts/UserContext';
import {WindowContext} from '../../contexts/WindowContext';
import Conversation from '../conversations/Conversation';
import ConvList from '../conversations/ConvList';
import DashboardNav from '../ui/DashboardNav';

function Conversations({match}) {
    
    //ROUTING
    //Define basepath to use in subroutes
    const {path} = match;
    const basePath = path.split('/')[1];

    //Optional ID for the current Conversation
    const {id} = useParams();

    //CONTEXTS
    const {windowWidth} = useContext(WindowContext);
    const {convserror, grouperror, convs, groupConvs, getSingleConv} = useContext(ConvContext);
    const {currentConv, setCurrentConv} = useContext(ConvContext);
    
    const {onlineUsers} = useContext(UserContext);

    //USE EFFECTS

    //get currentConv if there are conversations
    useEffect(() => {
        if(convs.length > 0){
            getCurrentConv();
        }
        return () => {
            setCurrentConv();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convs, onlineUsers]);

    //if user resizes from small screen to big screen, set a conversation visibile by default
    useEffect(() => {
        if(windowWidth > 800){
            if(!currentConv){
                getCurrentConv();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth]);


    // Keep this function independent from the convs -> separate refresh possible
    async function getCurrentConv(){
        //useSWR runs this function when user clicks back on browser window 
        // -> make sure he doesn't reset currentConv
        // -> also check if online status has changed for this conversation
        if(currentConv){
            if(currentConv.otherUser){
                currentConv.online = onlineUsers.filter(onlineUser => onlineUser.user_id === currentConv.otherUser.id).length;
            }
            setCurrentConv(currentConv);
            return;
        }

        //user comes from contactmodule and has selected a conversation to see
        if(id){
            const conv = await getSingleConv(id);
            setCurrentConv(conv);
        }

        //only set currentconv if there is no id and window isn't smallscreen (on smallscreen we want the convlist)
        //FOR NOW: cancel this: no standard currentConv -> issue when the top convItem is unread -> immediately read
        /* if(windowWidth > 800 && !id){
            const lastConv = convs.sort((a, b) => (b.lastMessage ? b.lastMessage.created_at : b.created_at) - (a.lastMessage ? a.lastMessage.created_at : a.created_at))[0];
            setCurrentConv(lastConv);
        } */      
    }


    return (
        <main className="dashboard-main container">

            {/* Version on mobile */}
            {windowWidth < 800 &&
            
                <div className="conv-full">
                    
                    {(!convserror && !grouperror && convs && groupConvs) &&
                        <>
                        {!currentConv && 
                            <>
                            <ConvList />
                            </>
                        }
                        {currentConv && <Conversation conv={currentConv} basePath={basePath} />}
                        <div className="navigation navigation-space navigation-bg">    
                            <Link className="button primary" to={`/${basePath}/contacts`} >Go to contacts</Link> 
                            {/* <Link className="button primary" to={`/${basePath}/group/create`} >Start Group Chat</Link> */}
                        </div>
                        </>
                    }
                    {(convserror || grouperror) && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </div>
            }

            {/* Version on widescreens */}
            {windowWidth > 800 &&
                <>
                {(!convserror && !grouperror && convs && groupConvs) &&
                    <>
                    <div className="conv-left">
                        <ConvList />
                        {/* <div className="navigation navigation-center navigation-border-top">    
                            <Link className="button primary" to={`/${basePath}/group/create`} >Start Group Chat</Link>
                        </div> */}
                        <DashboardNav path={`${basePath}/contacts`} text={`Go to contacts`} />
                    </div>
                    <div className="conv-right">
                        {currentConv && <Conversation conv={currentConv} basePath={basePath} />}
                        {(convs.length > 0 && !currentConv) && <div className="navigation navigation-center">No conversation selected. Click on a conversation in the left panel.</div>}
                    </div>
                    </>
                }
                {(convserror || grouperror) && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </>
            }

        </main>
    )
}

export default Conversations
