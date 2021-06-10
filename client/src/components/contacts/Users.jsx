import React, {useContext} from 'react'
import {ContactContext} from '../../contexts/ContactContext';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';

function Users() {

    const {sendRequest, users} = useContext(ContactContext);

    return (
        <>
        <h2 className="mg">Add more contacts</h2>
        <div className="contact-items-list otherusers-list">
            <div className="no-results">
                <p>Most of these accounts are just exemplary and (sadly) won't talk back.</p>
            </div>
            {users && users.map((user, index) => {
                return (
                    <div className="user-item contact-item otheruser-item" key={user.id}>
                        <div className="item-image">
                            <img src={user.photo_url ? `${imgPath}/${user.photo_url}` : profilepic} alt="profile-pic" />
                        </div>
                        <div className="item-content">
                            <p className="username">{user.username}</p>
                            <div className="item-options">
                            <button className="button secondary" onClick={(e) => {sendRequest(user)}}>send friend request</button>
                            {/* {index === 0 && <button className="button secondary" onClick={(e) => {sendAcceptedRequest(user)}}>add to contacts</button>} */}
                            </div>
                        </div>                        
                    </div>
                    )
            })}
        </div>
        </>
    )
}

export default Users
