import React, {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import {ContactContext} from '../../contexts/ContactContext';
import Accept from './Accept';
import {imgPath} from '../../Constants';
import {timeSinceSignup, timeSinceRel} from '../helpers/TimeSince';
import profilepic from '../../images/profile-blanc.svg';
import {FaTimes, FaCircle} from 'react-icons/fa';

function Accepts({id, basePath}) {
   
    //CONTEXTS
    const {contacts, getSingleContact} = useContext(ContactContext);
    const {accepts} = contacts;

    //STATES
    const [selectedContact, setSelectedContact] = useState();
    const [showOptions, setShowOptions] = useState(); // Integer, determines which accept shows its options by id changing

    //Setup a selectedContact if there is an id prop
    useEffect(() => {
        if(id){
        fetchContact();
        }
        return () => {
            setSelectedContact();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //FUNCTIONS
    
    //ONLY CALLED VIA ID (USER COMES FROM INDIVIDUAL CONVERSATION)
    async function fetchContact(){
        const contact = await getSingleContact(id);
        setSelectedContact(contact);
    }

    return (
        <>
        <h2 className="mg">My Contacts</h2>
        <div className="contact-items-list accepts-list">
            {accepts.length > 0 && accepts.map(accept => {
                return (
                    <Accept key={accept.id} accept={accept} selectedContact={selectedContact} setSelectedContact={setSelectedContact} showOptions={showOptions} setShowOptions={setShowOptions} />
                )
            })}
            {accepts.length === 0 && 
            <div className="no-results">
                <p>You have no contacts yet. Send a request in the "add more contacts" tab.</p>
            </div>
            }
        </div>
        {selectedContact && 
            <div className="contact-detail-wrap">
                <div className="contact-detail">
                    <button className="circle secondary flex" onClick={() => setSelectedContact(false)}><FaTimes size={15} /></button>
                    <div className="contact-detail-image">
                        <img src={selectedContact.otherUser.photo_url ? `${imgPath}/${selectedContact.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                        {selectedContact.online ? <span className="online-icon"><FaCircle size={16} /></span> : ""}
                    </div>
                    
                    <h2>{selectedContact.otherUser.username}</h2>
                    <p>Member since {timeSinceSignup(selectedContact.otherUser.created_at)}</p>
                    <p>Friends since {timeSinceRel(selectedContact.created_at)}</p>
                    <Link className="button primary" to={`/${basePath}/conversations/${selectedContact.conv_id}`}>View chat</Link>
                </div>
            </div>
        }
        </>
    )
}

export default Accepts
