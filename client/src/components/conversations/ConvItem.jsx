import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import {timeSinceConvs} from '../helpers/TimeSince';
import {FaCircle} from 'react-icons/fa';

function ConvItem({conv, currentConv, setCurrentConv}) {

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    //setup classes
    let classes = "user-item convs-item";
    if(currentConv){
        classes += currentConv.id === conv.id ? " user-item-active" : "";
    }

    return (
        <Link to="/dashboard/conversations" onClick={(e) => {setCurrentConv(conv)}}>
            <div key={conv.id} className={classes} >
                <div className="item-image">
                    <img src={conv.imageUrl} alt="profile" />
                    {conv.online ? <span className="online-icon"><FaCircle size={13} /></span> : ""}
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
