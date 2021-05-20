import React from 'react';
import {timeSinceAbs, timeSinceAbsWithDay} from '../helpers/TimeSince';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';

function Message({message, conv}) {

    //Setup classes
    let classes = "message-item-block";
    classes += message.received ? " received" : " sent";

    return (
        <div key={message.id} className="message-item">
            {message.startBlock && 
                <div className="message-item-above">
                    <span>
                        { message.fullDay ? timeSinceAbsWithDay(message.created_at) : timeSinceAbs(message.created_at) }
                    </span>
                </div>
            }
            
            <div className={classes}>
                <div className="message-item-block-image">
                    {message.endBlock && 
                        <img src={message.user_id.photo_url ? `${imgPath}/${message.user_id.photo_url}` : profilepic} alt="profile-pic" />
                    }
                </div>
                <div className="message-item-block-right">
                    {(message.setName && !conv.otherUser) && 
                        <p className="sentby">{message.user_id.username}</p>
                    }
                    <div className="message-item-block-right-content">{message.body}</div>
                </div>
            </div>
        </div>
    )
}

export default Message
