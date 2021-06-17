import React, {useContext, useLayoutEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import OnlineIcon from '../ui/OnlineIcon';
import {ContactContext} from '../../contexts/ContactContext';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';
import {BsThreeDots} from 'react-icons/bs';

function Accept({accept, selectedContact, setSelectedContact, showOptions, setShowOptions}) {

    //CONTEXTS
    const {deleteContact, blockContact} = useContext(ContactContext);
    
    //REFS
    const optionBtn = useRef();

    //USE EFFECT -> click outside of show Options button on user -> hide options
    useLayoutEffect(() => {
        const handleWindowClick = (e) => {
            if(!e.target.classList.contains("optionBtn")){
                setShowOptions(0);
            }
        }
        window.addEventListener('click', handleWindowClick);
        return () => {
            window.removeEventListener('click', handleWindowClick);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Setup classes
    let classes = "user-item contact-item accept-item";

    if(selectedContact){
        classes += selectedContact.id === accept.id ? " user-item-active" : "";
    }

    return (
        // This is a link so that the url goes to default when switching selected contact
        <Link to="/dashboard/contacts" onClick={(e) => {
            if(e.target.tagName.toLowerCase() !== "button"){
                setSelectedContact(accept);
            }
        }}>
        <div className={classes} key={accept.id}> {/*Id is contact id, not user id */}
            <div className="item-image">
                <img src={accept.otherUser.photo_url ? `${imgPath}/${accept.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                {accept.online ? <OnlineIcon size='16px' right='0px' bottom='0px' /> : ""}
            </div>
            <div className="item-content">
                <p className="username">{accept.otherUser.username}</p>
                {showOptions === accept.id ? <div className="item-options">
                <button className="button secondary" onClick={() => {
                    deleteContact(accept.id, accept.conv_id, accept.otherUser);
                    setSelectedContact();
                }}>Delete</button>
                <button className="button secondary" onClick={() => {
                    blockContact(accept.id, accept.conv_id, accept.otherUser);
                    setSelectedContact();
                }}>Block</button>
                </div> : null}
            </div>
                        
            <button ref={optionBtn} className="circle secondary flex optionBtn" onClick={(e) => {
                showOptions === accept.id ? setShowOptions() : setShowOptions(accept.id)
            }}><BsThreeDots size={16} /></button>
        </div>
        </Link>
    )
}

export default Accept
