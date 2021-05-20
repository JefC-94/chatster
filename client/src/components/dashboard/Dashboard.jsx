import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import ContactContextProvider from '../../contexts/ContactContext';
import ConvContextProvider from '../../contexts/ConvContext';
import Contacts from './Contacts';
import Conversations from './Conversations';
import Profile from '../user/Profile';
import Header from './Header';
import CreateGroupConv from '../groupconvs/CreateGroupConv';
import UpdateGroupConv from '../groupconvs/UpdateGroupConv';

function Dashboard({ match }) {

    return (
        <ContactContextProvider>
        <ConvContextProvider>
        <Header match={match} />
        <Switch>
            <Route
                exact
                path={`${match.path}/`}
                render={() => {
                    return (
                        <Redirect to={`${match.path}/conversations`} />
                    )
                }}
            />
            <Route path={`${match.path}/conversations/:id?`} component={Conversations} />
            <Route path={`${match.path}/contacts/:id?`} component={Contacts} />
            <Route path={`${match.path}/profile`} component={Profile} />
            <Route path={`${match.path}/group/create`} component={CreateGroupConv} />
            <Route path={`${match.path}/group/:id/update`} component={UpdateGroupConv} />
        </Switch>
        </ConvContextProvider>
        </ContactContextProvider>
    )
}

export default Dashboard
