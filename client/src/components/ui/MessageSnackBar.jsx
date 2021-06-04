import React, {useEffect} from 'react'
import {FaTimes} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import { imgPath } from '../../Constants';

function MessageSnackBar(props) {
    
    const { messageSnackBar, hide, setMessageSnackBar} = props;
    
    useEffect(() => {
        if(hide && messageSnackBar.open){
            setTimeout(() => setMessageSnackBar({open: false, data: {user: {}}}), hide);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageSnackBar]);

    return (
        
        <div className="snackbar-wrapper message-snackbar"
            style={{
                transform: messageSnackBar.open ? 'translateX(0px)' : 'translateX(-200px)',
                opacity: messageSnackBar.open ? '1' : '0'
            }}>
            <Link to={`/dashboard/conversations/${messageSnackBar.data.conv_id}`} >
            <div className="message-snackbar-content">
                    <div className="left">
                        <img src={`${imgPath}/${messageSnackBar.data.user.photo_url}`} alt="profile"/>
                        <p>
                            {messageSnackBar.data.user.username}: 
                        </p>
                        <p className="message">
                        {messageSnackBar.data.body}
                        </p>
                    </div>
                    <div className="right">
                        <button 
                        type="button"
                        className="close-snackbar-btn" 
                        onClick={() => setMessageSnackBar({open: false, data: {user: {}}})}
                        ><FaTimes size={15} />
                        </button>
                    </div>
            </div>
            </Link>
        </div>
       
    )
}

export default MessageSnackBar