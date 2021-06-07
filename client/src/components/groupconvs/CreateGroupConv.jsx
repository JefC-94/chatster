import React, {useState, useContext} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {ContactContext} from '../../contexts/ContactContext';
import {UserContext} from '../../contexts/UserContext';
import {imgPath} from '../../Constants';
import axios from 'axios';
import profilepic from '../../images/profile-blanc.svg';
import { ConvContext } from '../../contexts/ConvContext';
import { mutate } from 'swr';
import { ModalContext } from '../../contexts/ModalContext';

function CreateGroupConv({match, history}) {

    //ROUTING
    //define basePath for navigation components
    const {path} = match;
    const basePath = path.split('/')[1];

    //CONTEXTS
    const {contacts} = useContext(ContactContext);
    const {accepts} = contacts;

    const {groupurl} = useContext(ConvContext); // MUTATE THIS? _> at this moment not working

    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;
    
    const {setSnackBar} = useContext(ModalContext);

    //STATE
    const [formData, setFormData] = useState({
        name: "",
        userids : []
    });

    const [error, setError] = useState(false);


    //FUNCTIONS

    function onContactCheck(target){
        if(target.checked){
            setFormData(prevVal => ({...prevVal, userids: [...prevVal.userids, +target.value]}));
        } else {
            setFormData(prevVal => ({...prevVal, userids: [...prevVal.userids.filter(userid => userid !== +target.value)]}));
        }
    }

    //api calls: create one conversation and create a user_conv per user!
    async function onHandleFormSubmit(){
        if(formData.userids.length >= 2){
            //Create new conversation
            try {
            const timestamp = Math.floor(new Date().getTime() / 1000 );
            const request = await axios.post(`/api/convs/user_id=${theUser.id}`, {
                name: formData.name,
                created_at : timestamp,
                created_by : theUser.id,
                photo_url : null
            });
            console.log(request.data.message);
            const new_convid = request.data.message;
            
                try{
                    //Create user_conv row for the creating user
                    const request2 = await axios.post(`/api/userconvs/user_id=${theUser.id}`, {
                        user_id : theUser.id,
                        conv_id : new_convid,
                        created_at : timestamp,
                    });
                    console.log(request2.data.message);

                    try {
                        //create user_conv row for every userid in formdata
                        formData.userids.forEach(async (userid) => {
                            const request = await axios.post(`/api/userconvs/user_id=${theUser.id}`, {
                                user_id : userid,
                                conv_id : new_convid,
                                created_at : timestamp,
                            });
                            console.log(request.data.message);
                        });
                        mutate(groupurl);
                        setSnackBar({open: true, message: "Group chat created"});
                        history.push('/dashboard/conversations');
                    } catch(error){
                        console.log(error.response.data.message);
                    }
                } catch(error){
                    console.log(error.response.data.message);
                }
            } catch(error){
                console.log(error.response.data.message);
            }
        } else {
            setError(true);
        }
    }

    return (
        <main className="dashboard-main groupconv-main container">
            <div className="edit-header">
                <div className="edit-header-center">
                    <h2>Create Group Chat</h2>
                    <Link to={`/${basePath}/conversations`} className="button secondary">Cancel</Link>
                </div>
            </div>
            <div className="groupconvs-wrap">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onHandleFormSubmit();
                }}>
                    <div className="form-control">
                        <label htmlFor="name">
                            Enter a name for this chat (optional)
                        </label>
                        <input type="text" className="form-input" name="name" value={formData.name} onChange={(e) => {setFormData(prevVal => ({...prevVal, name: e.target.value}))}}/>
                    </div>
                    <p className="select-contacts-label">Select contacts</p>
                    <div className="form-control selects">
                        {accepts.map(accept => {
                        return (
                            <label key={accept.id} className="user-item select-item" htmlFor={`contact${accept.id}`} >
                                <div className="select-item-info">
                                    <img src={accept.otherUser.photo_url ? `${imgPath}/${accept.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                                    <p>{accept.otherUser.username}</p>
                                </div>
                                <input 
                                id={`contact${accept.id}`} 
                                type="checkbox" 
                                value={accept.otherUser.id} 
                                onChange={(e) => onContactCheck(e.target)} />
                            </label>
                        )
                        })
                        }
                    </div>
                    {error && <p className="error">You need to select at least two contacts</p>}
                    <div className="form-control">
                        <button className="button primary" type="submit" >Create</button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default withRouter(CreateGroupConv); //withRouter necessary for history.push!
