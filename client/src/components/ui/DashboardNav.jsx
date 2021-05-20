import React from 'react';
import {Link} from 'react-router-dom';

//NAVIGATION USED IN CONTACTS & CONVERSATIONS COMPONENT TO SWITCH

function DashboardNav({path, text}) {
    return (
        <div className="navigation navigation-center navigation-bg">
            <Link className="button primary" to={`/${path}`}>{text}</Link>
        </div>
    )
}

export default DashboardNav