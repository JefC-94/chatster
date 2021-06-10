import React, {useContext} from 'react'
import {ContactContext} from '../../contexts/ContactContext';
import profilepic from '../../images/profile-blanc.svg';
import {imgPath} from '../../Constants';

function Pendings() {

    const {contacts, cancelRequest} = useContext(ContactContext);
    const {pendings} = contacts;

    return (
        <div className="pendings-wrap">
            <h2 className="mg">Pending</h2>
            <div className="contact-items-list pendings-list">
            {pendings.length > 0 && pendings.map(pending => {
                return (
                    <div className="user-item contact-item pending-item" key={pending.id}> {/* dit moet id van contact tabel zijn ipv id van user -> easy cancel! */}
                        <div className="item-image">
                        <img src={pending.otherUser.photo_url ? `${imgPath}/${pending.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                        </div>
                        <div className="item-content">
                            <p className="username">{pending.otherUser.username}</p>
                            <div className="item-options">
                                <button className="button secondary" onClick={(e) => {cancelRequest(pending.id, pending.otherUser)}}>cancel</button>
                            </div>
                        </div>
                    </div>
                )
            })}
            {pendings.length === 0 && 
                <div className="no-results">
                    <p>When you invite someone to chat with you, it will show up here.</p>
                </div>
            }
            </div>
        </div>
    )
}

export default Pendings
