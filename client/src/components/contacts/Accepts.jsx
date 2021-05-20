import React, {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import {ContactContext} from '../../contexts/ContactContext';
import Accept from './Accept';
import {Axios, imgPath} from '../../Constants';
import {timeSinceSignup, timeSinceRel} from '../helpers/TimeSince';
import profilepic from '../../images/profile-blanc.svg';
import {FaTimes} from 'react-icons/fa';

function Accepts({id, basePath}) {
   
    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    const loginToken = localStorage.getItem('loginToken');
    Axios.defaults.headers.common['X-Authorization'] = 'bearer ' + loginToken;

    //CONTEXTS
    const {contacts} = useContext(ContactContext);
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
    
    async function fetchContact(){
        //let request = await axiosObject(`/contact?join=users&filter=id,eq,${id}`);
        let request = await Axios(`/contact.php?id=${id}&user_id=${theUser.id}`);
        const contact = request.data.records;
        contact.otherUser = contact.user_1.id === theUser.id ? contact.user_2 : contact.user_1;
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
                    <img src={selectedContact.otherUser.photo_url ? `${imgPath}/${selectedContact.otherUser.photo_url}` : profilepic} alt="profile-pic" />
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
