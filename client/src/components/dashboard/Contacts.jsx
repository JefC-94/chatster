import React, {useState, useContext} from 'react';
import {useParams} from 'react-router-dom';
import {WindowContext} from '../../contexts/WindowContext';
import {ContactContext} from '../../contexts/ContactContext';
import Accepts from '../contacts/Accepts';
import Requests from '../contacts/Requests';
import Pendings from '../contacts/Pendings';
import Users from '../contacts/Users';
import DashboardNav from '../ui/DashboardNav';
import NavButton from '../contacts/NavButton';
import {FaChevronUp, FaChevronDown} from 'react-icons/fa';

function Contacts({match}) {

    //ROUTING
    //Define basepath to use in subroutes
    const {path} = match;
    const basePath = path.split('/')[1];

    //this is the contact id (optional) for the accepts -> selectedContact
    const {id} = useParams();

    //CONTEXTS
    const {error} = useContext(ContactContext);

    const {windowWidth} = useContext(WindowContext);

    //STATES
    //mid size screen only:
    const [showUsers, setShowUsers] = useState(false);

    //small screen only:
    const [activeTab, setActiveTab] = useState('My Contacts');

    return (
        <>
        <main className="dashboard-main container">

            {windowWidth < 600 &&
                <div className="contacts-full">
                    {!error && 
                        <>
                        <nav className="contact-navigation">
                            <NavButton link="My Contacts" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <NavButton link="Pending" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <NavButton link="Requests" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <NavButton link="Add more contacts" activeTab={activeTab} setActiveTab={setActiveTab} />
                        </nav>
                        {activeTab === "My Contacts" && <Accepts id={id} basePath={basePath} />}
                        {activeTab === "Pending" && <Pendings />}
                        {activeTab === "Requests" && <Requests />}
                        {activeTab === "Add more contacts" && <Users />}
                        <DashboardNav path={`${basePath}/conversations`} text={`Go to chat`} />
                        </>
                    }
                    {error && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </div>
            }

            {windowWidth > 600 && windowWidth < 900 &&
                <>
                {!error && 
                <>
                <div className="contacts-column contacts-left">
                    <Accepts id={id} basePath={basePath} />
                    <div className="left-column-break">
                        <button className="button secondary flex" onClick={() => {setShowUsers(prevVal => !prevVal)}}>
                            <span>Add more contacts</span>
                            {showUsers ? <FaChevronDown size={16} /> : <FaChevronUp size={16} />}
                        </button>
                    </div>
                    {showUsers && <Users />}
                    <DashboardNav path={`${basePath}/conversations`} text={`Go to chat`} />
                </div>
                <div className="contacts-column contacts-right">
                    <Requests />
                    <Pendings />
                </div>
                </>
                }
                {error && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </>
            }

            {windowWidth > 900 &&
                <>
                    {!error && 
                    <>
                    <div className="contacts-column contacts-left">
                        <Accepts id={id} basePath={basePath} />
                        <DashboardNav path={`${basePath}/conversations`} text={`Go to chat`} />
                    </div>
                    <div className="contacts-column contacts-middle">
                        <Requests />
                        <Pendings />
                    </div>
                    <div className="contacts-column contacts-right">
                        <Users />
                    </div>
                    </>
                    }
                    {error && <div className="error-message">Oops... Something went wrong. Please try again later!</div>}
                </>
            }

        </main>
        </>
        
    )

}

export default Contacts
