import React, {useState, useEffect, useContext} from 'react';
import {useParams, Link} from 'react-router-dom';
import {ConvContext} from '../../contexts/ConvContext';
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
    const {convserror, grouperror, convs, getSingleConv} = useContext(ConvContext);
    
    //STATES
    //this is the current active conversation, defined here because it can be set by id as well as click function on convItems
    const [currentConv, setCurrentConv] = useState(); 
    
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
    }, [convs]);

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
        //useSWR runs this function when user clicks back on browser window -> make sure he doesn't reset currentConv
        if(currentConv){
            setCurrentConv(currentConv);
            return;
        }

        //user comes from contactmodule and has selected a conversation to see
        if(id){
            const conv = await getSingleConv(id);
            setCurrentConv(conv);
        }

        //only set currentconv if there is no id and window isn't smallscreen (on smallscreen we want the convlist)
        if(windowWidth > 800 && !id){
            const lastConv = convs.sort((a, b) => (b.lastMessage ? b.lastMessage.created_at : b.created_at) - (a.lastMessage ? a.lastMessage.created_at : a.created_at))[0];
            setCurrentConv(lastConv);
        }        
    }


    return (
        <main className="dashboard-main container">

            {/* Version on mobile */}
            {windowWidth < 800 &&
            
                <div className="conv-full">
                    
                    {(!convserror && !grouperror && convs) &&
                        <>
                        {!currentConv && 
                            <>
                            <ConvList convs={convs} currentConv={currentConv} setCurrentConv={setCurrentConv} />
                            </>
                        }
                        {currentConv && <Conversation conv={currentConv} setCurrentConv={setCurrentConv} getCurrentConv={getCurrentConv} basePath={basePath} />}
                        <div className="navigation navigation-space navigation-bg">    
                            <Link className="button primary" to={`/${basePath}/contacts`} >Go to contacts</Link> 
                            <Link className="button primary" to={`/${basePath}/group/create`} >Start Group Chat</Link>
                        </div>
                        </>
                    }
                    {(convserror || grouperror) && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </div>
            }

            {/* Version on widescreens */}
            {windowWidth > 800 &&
                <>
                {(!convserror && !grouperror && convs) &&
                    <>
                    <div className="conv-left">
                        <ConvList convs={convs} currentConv={currentConv} setCurrentConv={setCurrentConv} getCurrentConv={getCurrentConv} />
                        <div className="navigation navigation-center navigation-border-top">    
                            <Link className="button primary" to={`/${basePath}/group/create`} >Start Group Chat</Link>
                        </div>
                        <DashboardNav path={`${basePath}/contacts`} text={`Go to contacts`} />
                    </div>
                    <div className="conv-right">
                        {currentConv && <Conversation conv={currentConv} setCurrentConv={setCurrentConv} basePath={basePath} />}
                        {/** currentConv && above this line is absolutely necessary, need empty conv div for when there is none */}
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
