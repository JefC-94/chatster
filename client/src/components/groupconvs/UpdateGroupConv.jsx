import React, {useState, useEffect, useContext} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {ContactContext} from '../../contexts/ContactContext';
import {UserContext} from '../../contexts/UserContext';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';
import profilespic from '../../images/profiles-blanc.svg';
import axios from 'axios';
import { useParams } from 'react-router';
import { ConvContext } from '../../contexts/ConvContext';
import { mutate } from 'swr';
import Dialog from '../ui/Dialog';
import { ModalContext } from '../../contexts/ModalContext';
import {FaPlus, FaCheck} from 'react-icons/fa';
import {AiOutlineReload} from 'react-icons/ai';

function UpdateGroupConv({match, history}) {

    //ROUTING
    //Define basepath to use in subroutes
    const {path} = match;
    const basePath = path.split('/')[1];

    // Find the right conversation + user_convs based on this id! -> enter into formData!
    const {id} = useParams(); 

    //CONTEXTS
    const {contacts} = useContext(ContactContext);
    const {accepts} = contacts;

    const {groupurl} = useContext(ConvContext); // MUTATE THIS? _> at this moment not working

    const {setSnackBar} = useContext(ModalContext); 

    //USER
    const {rootState} = useContext(UserContext);
    const {theUser} = rootState;

    //STATES
    const [conv, setConv] = useState();

    const [addables, setAddables] = useState([]); // contacts that are not yet in this chat

    const [formData, setFormData] = useState({
        name: "",
        userids : []
    });

    const [error, setError] = useState(false);

    const [dialOpen, setDialOpen] = useState(false);

    const [showImageForm, setShowImageForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedUrl, setSelectedUrl] = useState();
    const [imgUpdated, setImgUpdated] = useState(false);
    const [imgError, setImgError] = useState(false);

    //SET VISIBLE TAB:
    const [openTab, setOpenTab] = useState('members');

    //USE EFFECTS

    useEffect(() => {
        getCurrentConv();
        return () => {
            setConv();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if(conv){
            getAddables();
        }
        return() => {
            setAddables([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conv]);

    useEffect(() => {
        if(conv){
            setFormData({
                name: conv.name,
                userids : []
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conv])
    
    useEffect(() => {
        if(conv){
            if (!selectedFile) {
                setSelectedUrl(conv.photo_url ? `${imgPath}/${conv.photo_url}` : profilespic)
                return
            }

            const objectUrl = URL.createObjectURL(selectedFile)
            setSelectedUrl(objectUrl)

            // free memory when ever this component is unmounted
            return () => URL.revokeObjectURL(objectUrl)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }, [conv, selectedFile])

    //FUNCTIONS

    async function getCurrentConv(){
        if(id){
            const request = await axios.get(`/api/groupconvs/id=${id}&user_id=${theUser.id}`);
            const conv = request.data;
            conv.displayName = conv.name;
            conv.imageUrl = conv.photo_url ? `${imgPath}/${conv.photo_url}` : profilespic;
            //get an array of just the ids for easier check which users are in convo
            conv.users = conv.user_conv 
                .filter(user_conv => user_conv.user_id.id !== theUser.id)
                .map(user_conv => user_conv.user_id.id);
            console.log(conv);
            setConv(conv);
        }
    }
    
    function getAddables(){
        setAddables(accepts.filter(accept => !conv.users.includes(accept.otherUser.id)));
    }

    function onContactCheck(target){
        if(target.checked){
            setFormData(prevVal => ({...prevVal, userids: [...prevVal.userids, +target.value]}));
        } else {
            setFormData(prevVal => ({...prevVal, userids: [...prevVal.userids.filter(userid => userid !== +target.value)]}));
        }
    }

    //api calls: create one conversation and create a user_conv per user!
    async function onHandleFormSubmit(){
        setError(false);
        if(theUser.id !== conv.created_by){
            console.log("not authorized!");
            return false;
        }
        //check if user has made changes, either changed name or adds users
        if(conv.name !== formData.name || formData.userids.length){
            //Update conversation
            const timestamp = Math.floor(new Date().getTime() / 1000 );
            const request = await axios.put(`/api/convs/id=${conv.id}&user_id=${theUser.id}`, {
                name: formData.name,
                photo_url : null
            });
            if(request.status === 200){
                //Create user_conv row for the newly added contacts
                await Promise.all(formData.userids.map(async (userid) => {
                    console.log(userid);
                    const request = await axios.post(`/api/userconvs/user_id=${theUser.id}`, {
                        user_id : userid,
                        conv_id : conv.id,
                        created_at : timestamp,
                    });
                    console.log(request.data);
                }));
                mutate(groupurl);
                getCurrentConv();
                setSnackBar({open: true, message: 'Group chat updated'});
                //history.push(`/dashboard/conversations/${conv.id}`);
            }
        }
    }

    //FUNCTIE VERPLAATSEN NAAR CONVCONTEXT?
    async function deleteGroupConv(){
        if(theUser.id !== conv.created_by){
            console.log("not authorized!");
            return false;
        }
        const request = await axios.delete(`/api/convs/id=${conv.id}&user_id=${theUser.id}`);
        console.log(request.data);
        if(request.status === 200){
            mutate(groupurl);
            setSnackBar({open: true, message: "Group chat deleted"});
            history.push(`/dashboard/conversations`);
        }
    }

    //FUNCTIE VERPLAATSEN NAAR CONVCONTEXT?
    async function deleteUserFromGroup(user_conv_id){
        if(conv.user_conv.length > 3){
            const request = await axios.delete(`/api/userconvs/id=${user_conv_id}&user_id=${theUser.id}`);
            console.log(request);
            if(request.data === 1){
                console.log("user deleted");
                getCurrentConv();
                mutate(groupurl);
                setSnackBar({open: true, message: 'User removed from group'});
            }
        } else {
            setError(true);
        }
    }

    function onFileChange(e){
        setImgError(false);
        setImgUpdated(false);
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }
        setSelectedFile(e.target.files[0]);
    }

    async function onFileUpload(){
        setImgError(false);
        if(theUser.id !== conv.created_by){
            console.log("not authorized!");
            return false;
        }
        const formData = new FormData();
        
        if(selectedFile){
            formData.append('fileToUpload', selectedFile
            );
        }
        
        const request = await axios.post(`/api/fileupload/conv-img&id=${conv.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        });
        console.log(request.data);
        if(request.data.success){
            setImgUpdated(true);
            setImgError(false);
            getCurrentConv();
            mutate(groupurl);
            setTimeout(() => setImgUpdated(false), 800);
            setTimeout(() => setSelectedFile(), 800);
            setSnackBar({open: true, message: "Group picture updated"});
        } else {
            setImgUpdated(false);
            setSelectedFile();
            setSelectedUrl();
            setImgError(request.data.message);
        }
    }

    return (
        <main className="dashboard-main groupconv-main container">
            <div className="groupconvs-header">
                <div className="groupconvs-header-center">
                    <h2>Update Group Chat</h2>
                    <Dialog
                        title="Delete Conversation"
                        open={dialOpen}
                        setOpen={setDialOpen}
                        onConfirm={deleteGroupConv}
                    >
                        Are you sure you want to delete this group chat?
                    </Dialog>
                </div>
                <Link to={`/${basePath}/conversations`} id="cancelEditBtn" className="button secondary">Back</Link>
            </div>
            <div className="groupconvs-below-header">
            <button className="button secondary" onClick={() => {setShowImageForm(prevVal => !prevVal)}}>Edit picture</button>
            </div>
            {conv && showImageForm && <div className="form-profile-picture">
                <img src={selectedUrl} alt="profilespic" />
                <div className="profile-picture-change flex">
                    <label htmlFor="profile-pic">
                        {!conv.photo_url && !selectedFile && <FaPlus />}
                        {conv.photo_url && !selectedFile && <AiOutlineReload />}
                        {conv.photo_url && imgUpdated && <FaCheck />}
                    </label>
                    <input type="file" id="profile-pic" onChange={onFileChange} />
                    {selectedFile &&
                    <>
                    <p className="filename">{selectedFile.name}</p>
                    <button className="button secondary" onClick={onFileUpload}>Set as group picture</button>
                    </>}
                    {imgError && <p className="error">{imgError}</p>}
                </div>
            </div>}
            {conv && <div className="groupconvs-wrap">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onHandleFormSubmit();
                }}>
                    <div className="form-control">
                        <label htmlFor="name">
                            Name (optional)
                        </label>
                        <input type="text" className="form-input" name="name" value={formData.name} onChange={(e) => {setFormData(prevVal => ({...prevVal, name: e.target.value}))}}/>
                    </div>
                    <nav>
                        <button type="button" className={openTab === 'members' ? "activeLink link" : "link"} onClick={() => {setOpenTab('members');setError(false);}}>Members</button>
                        <button type="button" className={openTab === 'addcontacts' ? "activeLink link" : "link"} onClick={() => {setOpenTab('addcontacts');setError(false);}}>Add contacts</button>
                    </nav>
                    {openTab === 'members' && 
                        <>
                        <div className="form-control members">
                            {conv.user_conv.filter(user_conv => user_conv.user_id.id !== theUser.id).map(user_conv => {
                                return (
                                    <div key={user_conv.user_id.id} className="user-item member-item">
                                        <div className="member-item-info">
                                            <img src={user_conv.user_id.photo_url ? `${imgPath}/${user_conv.user_id.photo_url}` : profilepic} alt="profile-pic" />
                                            <p>{user_conv.user_id.username}</p>
                                        </div>
                                        <button type="button" className="button secondary" onClick={() => {deleteUserFromGroup(user_conv.id)}}>Remove</button>
                                    </div>
                                )
                            })}
                        </div>
                        </>
                    }
                    {openTab === 'addcontacts' &&
                        <>
                        {addables.length !== 0 && 
                        <div className="form-control select-contacts-wrap">
                            {addables.map(addable => {
                                return (
                                    <label key={addable.id} className="user-item select-item" htmlFor={`contact${addable.id}`} >
                                        <div className="select-item-info">
                                            <img src={addable.otherUser.photo_url ? `${imgPath}/${addable.otherUser.photo_url}` : profilepic} alt="profile-pic" />
                                            <p>{addable.otherUser.username}</p>
                                        </div>
                                        <input 
                                        id={`contact${addable.id}`} 
                                        type="checkbox" 
                                        value={addable.otherUser.id}
                                        checked={formData.userids.filter(id => id === addable.otherUser.id).length > 0 ? true : false} 
                                        onChange={(e) => onContactCheck(e.target)} />
                                    </label>
                                )
                            })
                            }
                        </div>}
                        {accepts.filter(accept => !conv.users.includes(accept.otherUser.id)).length === 0 && 
                            <div className="form-control">
                                <p>All your contacts are in this group chat</p>
                            </div>
                        }
                        </>
                    }
                    {error && <p className="error">You need at least two other users in a group chat.</p>}
                    <div className="form-control actions">
                        <button className="button primary" type="submit" >Update</button>{/* {JSON.stringify(snackBar)} */}
                        <button type="button" className="button secondary" onClick={() => {setDialOpen(true)}}>Delete this chat</button>
                    </div>
                </form>
                </div>}
            <div className="navigation navigation-center">
                
            </div>
        </main>
    )
}

export default withRouter(UpdateGroupConv);