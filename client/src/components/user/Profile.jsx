import React, {useState, useContext, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext';
import axios from 'axios';
import {imgPath} from '../../Constants';
import profilepic from '../../images/profile-blanc.svg';
import {FaPlus, FaCheck, FaTimes} from 'react-icons/fa';
import {AiOutlineReload} from 'react-icons/ai';
import { timeSinceSignup } from '../helpers/TimeSince';
import { ModalContext } from '../../contexts/ModalContext';

function Profile({match}) {

    //ROUTES
    const {path} = match;
    const basePath = path.split('/')[1];

    //CONTEXTS
    const {setSnackBar} = useContext(ModalContext);

    //USER
    const {rootState, editUser, isLoggedIn} = useContext(UserContext);
    const {theUser} = rootState;

    //STATES
    const initialState = {
        id: theUser.id,
        username: theUser.username,
        oldPassword: '',
        newPassword: ''
    }
    
    const [changePassword, setChangePassword] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedUrl, setSelectedUrl] = useState();
    const [imgUpdated, setImgUpdated] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    
    const [userInfo,setUserInfo] = useState(initialState);

    const [error, setError] = useState(false);

    //USE EFFECTS
    //Selected file changes -> setup selectedUrl to show image
    useEffect(() => {
        if (!selectedFile) {
            setSelectedUrl(theUser.photo_url ? `${imgPath}/${theUser.photo_url}` : profilepic)
            return
        }

        const objectUrl = URL.createObjectURL(selectedFile)
        setSelectedUrl(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile])

    // On change input value (only username & password)
    const onChangeValue = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]:e.target.value
            }
        );
    }
    
    const submitForm = async (e) => {
        e.preventDefault();

        if(!userInfo.username){
            setError({ type:"username", message:"Please fill in a new username."});
            return;
        }
        if(!userInfo.oldPassword){
            setError({ type: "old-password", message: "Please fill in your current password."});
            return;
        }
        setError(false);

        try{
            const data = await editUser(userInfo);
            console.log(data.message);
            isLoggedIn();
            setUserInfo(initialState);
            setSnackBar({open: true, message: 'You have successfully updated your profile'});
            setChangePassword(false);
        } catch(error){
            console.log(error.response.data.message);
            setError({
                type: error.response.data.type,
                message: error.response.data.message
            });
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
        setImgLoading(true);
        const formData = new FormData();
        
        if(selectedFile){
            formData.append('fileToUpload', selectedFile,
                selectedFile.name, 
            );
        }
        //Only request that is for now not with try/catch
        
        try {
            const request = await axios.post(`/api/fileupload/profile&user_id=${theUser.id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            });
            console.log(request.data.message);
            setImgUpdated(true);
            setImgLoading(false);
            setImgError(false);
            setTimeout(() => setImgUpdated(false), 800);
            setTimeout(() => setSelectedFile(), 800);
            isLoggedIn();
            setSnackBar({open: true, message: "Profile picture updated"});
        } catch(error){
            setImgUpdated(false);
            setImgLoading(false);
            setSelectedFile();
            setSelectedUrl();
            setImgError(error.response.data.message.message);
            console.log(error.response.data.message.message);
        }
    }

    async function deleteImage(){
        try{
            const request = await axios.delete(`/api/fileupload/profile&user_id=${theUser.id}`);
            console.log(request.data);
            setImgError(false);
            setSelectedUrl(profilepic);
            isLoggedIn();
            setSnackBar({open: true, message: "Profile picture deleted"});
        }catch(error){
            console.log(error.response.data.message);
        }
    }

    return (
        <main className="dashboard-main profile-main container">
            <div className="edit-header">
                <div className="edit-header-center">
                    <h2>Edit my profile</h2>
                    <Link className="button secondary" id="cancelEditBtn" to={`/${basePath}`}>Back</Link>
                </div>
            </div>
            <p className="divider">Member since {timeSinceSignup(theUser.created_at)}</p>
            <div className="form-profile-picture">
                <img src={selectedUrl} alt="profilepic" />
                {
                (selectedUrl !== profilepic && !selectedFile) &&
                <button className="circle primary flex deleteimage" onClick={() => deleteImage()}><FaTimes /></button>
                }
                <div className="profile-picture-change flex">
                    <label htmlFor="profile-pic">
                        {!theUser.photo_url && !selectedFile && <FaPlus />}
                        {theUser.photo_url && !selectedFile && <AiOutlineReload />}
                        {theUser.photo_url && imgUpdated && <FaCheck />}
                        
                    </label>
                    <input type="file" name="fileToUpload" id="profile-pic" onChange={onFileChange} />
                    {selectedFile &&
                    <>
                    <p className="filename">{selectedFile.name}</p>
                    <button className="button secondary" onClick={onFileUpload}>Set as profile picture</button>
                    </>}
                    {imgError && <p className="error">{imgError}</p>}
                    {imgLoading && <p className="">Uploading image...</p>}
                </div>
            </div>
            <form id="edit-form" onSubmit={submitForm}>
                <div className="form-control">
                    <label htmlFor="username">Username</label>
                    <input className="form-input" type="text" name="username" value={userInfo.username} onChange={onChangeValue}/>
                    {error.type === "username" && 
                        <p className="error">{error.message}</p>
                    }
                </div>
                <div className="form-control">
                    <label htmlFor="password">Current Password</label>
                    <input className="form-input" type="password" id="old-password" name="oldPassword" value={userInfo.oldPassword} onChange={onChangeValue} />
                    {error.type === "old-password" && 
                        <p className="error">{error.message}</p>
                    }
                </div>
                <div className="form-control">
                    <button className="button secondary" onClick={(e) => {
                        e.preventDefault();
                        setChangePassword(prevVal => !prevVal);
                    }} type="button">Change password</button>
                </div>
                {changePassword && <div className="form-control">
                    <label htmlFor="new-password">New password</label>
                    <input className="form-input" type="password" id="new-password" name="newPassword" value={userInfo.newPassword} onChange={onChangeValue} />
                    {error.type === "new-password" && 
                        <p className="error">{error.message}</p>
                    }
                </div>}
                <div className="form-control">
                    <button className="button primary" type="submit" >Save Changes</button>
                </div>
            </form>
        </main>
    )
}

export default Profile
