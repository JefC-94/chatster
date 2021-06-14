import React, {useEffect} from 'react'
import {FaTimes} from 'react-icons/fa';

function Snackbar(props) {
    
    const { snackBar, hide, setSnackBar} = props;
    
    useEffect(() => {
        if(hide && snackBar.open){
            setTimeout(() => setSnackBar({open: false, message: ''}), hide);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snackBar]);

    return (
        <div className="snackbar-wrapper"
            style={{
                transform: snackBar.open ? 'translateX(0px)' : 'translateX(-500px)',
                opacity: snackBar.open ? '1' : '0'
            }}>
            <div className="snackbar-content">
                <p>
                {snackBar.message}
                </p>
                <button 
                    type="button"
                    className="close-snackbar-btn" 
                    onClick={() => setSnackBar({open: false, message: ""})}
                ><FaTimes size={15} /></button>
            </div>
        </div>
    )
}

export default Snackbar
