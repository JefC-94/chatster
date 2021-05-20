import React, {useContext} from 'react';
import {ContactContext} from '../../contexts/ContactContext';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';

function Requests() {

    const {contacts, acceptRequest, rejectRequest} = useContext(ContactContext);
    const {requests} = contacts;

    return (
        <div className="requests-wrap">
            <h2 className="mg">Requests</h2>
            <div className="contact-items-list requests-list">
            {requests.length > 0 && requests.map(request => {
                return (
                <div className="user-item contact-item request-item" key={request.id}>
                    <img src={request.otherUser.photo_url ? `${imgPath}/${request.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                    <div className="item-content">
                        <p>{request.otherUser.username} </p>
                        <div className="item-options">
                            <button className="button primary" onClick={(e) => {acceptRequest(request.id)}}>accept</button>
                            <button className="button secondary" onClick={(e) => {rejectRequest(request.id)}}>reject</button>
                        </div>
                    </div>
                </div>
                )
            })}
            {requests.length === 0 && 
            <div className="no-results">
                <p>You have no requests at the moment. When others invite you to chat, it will show up here.</p>
            </div>}
            </div>
        </div>
    )
}

export default Requests
