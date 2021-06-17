import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import {timeSinceConvs} from '../helpers/TimeSince';
import { ConvContext } from '../../contexts/ConvContext';
import OnlineIcon from '../ui/OnlineIcon';

function ConvItem({conv}) {

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    const {currentConv, setCurrentConv} = useContext(ConvContext);

    //setup classes
    let classes = "user-item convs-item";
    let active = "";
    let unread = "";

    if(currentConv){
        active = currentConv.id === conv.id ? " user-item-active" : "";
    }
  
    //Compare to currentConv if there is one, otherwise follow unread value
    if(currentConv){
        unread = currentConv.id === conv.id ? "" : conv.unread ? 'convs-item-new' : '';
    } else {
        unread = conv.unread ? 'convs-item-new' : '';
    }

    return (
        <Link to="/dashboard/conversations" onClick={(e) => {
                //user clicks on the convItem -> set this as currentConv + if necessary, delete from unreadConvs
                setCurrentConv(conv);
            }}>
            <div key={conv.id} className={`${classes} ${active} ${unread}`} >
                <div className="item-image">
                    <img src={conv.imageUrl} alt="profile" />
                    {conv.online ? <OnlineIcon size='15px' right='0px' bottom='0px' /> : ""}
                </div>
                <div className="item-content">
                    <p className="username">{conv.displayName}</p>
                    {conv.lastMessage &&  
                        <p className="last-message">
                            {conv.lastMessage.user_id.id === theUser.id ? "you: " : conv.otherUser ? "" : conv.lastMessage.user_id.username + ": "}
                            {conv.lastMessage.body}
                        </p>}
                </div>
                <p className="timestamp">{conv.lastMessage ? timeSinceConvs(conv.lastMessage.created_at) : timeSinceConvs(conv.created_at)}</p>
            </div>
        </Link>
    )
}

export default ConvItem
