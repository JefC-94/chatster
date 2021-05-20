import React, {useLayoutEffect, useRef} from 'react'

function Dialog(props) {
    
    const overlay = useRef();

    const { title, children, open, setOpen, onConfirm } = props;

    useLayoutEffect(() => {
        const handleWindowClick = (e) => {
            if(e.target === overlay.current){
                setOpen(false);
            }
        }
        window.addEventListener('click', handleWindowClick);
        return () => {
            window.removeEventListener('click', handleWindowClick);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={overlay} className="dialog-overlay"
            style={{
                display: open ? 'block' : 'none'
            }}
        >
            <div className="dialog-wrapper">
                <div className="dialog-title">
                    <h2>{title}</h2>
                </div>
                <div className="dialog-content">
                    <p>{children}</p>
                </div>
                <div className="dialog-actions">
                    <button className="button primary" onClick={() => onConfirm()}>Yes</button>
                    <button className="button secondary" onClick={() => setOpen(false)}>No</button>
                </div>
            </div>
        </div>
    )
}

export default Dialog
