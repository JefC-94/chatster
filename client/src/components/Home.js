import React, {useContext} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import {UserContext} from '../contexts/UserContext';
import {ModalContext} from '../contexts/ModalContext';
import Dashboard from './dashboard/Dashboard';
import Lobby from './Lobby';
import About from './About';
import SnackBar from './ui/SnackBar';

//Protected directory, this route is not accessible unless authenticated user
function PrivateRoute({component: Component, path, ...rest}){
    const {rootState} = useContext(UserContext);
    const {isAuth} = rootState;
    
    return (  
        <Route path={path} {...rest} render={(props) => (
            isAuth
            ? (<Component {...props} />)
            : (<Redirect to='/lobby' />)
        )} />
    );
};

function Home(){
    
    const {rootState} = useContext(UserContext);
    const {isAuth} = rootState;

    const {snackBar, setSnackBar} = useContext(ModalContext);

    return (
        <>
            <Switch>
                <Route
                    exact
                    path="/"
                    render={() => {
                        if(isAuth){
                            return(<Redirect to="/dashboard" />)
                        } else {
                            return (<Redirect to="/lobby" />)
                        }
                    }}
                />
                <Route path='/lobby' component={Lobby} />
                <Route path='/about' component={About} />
                <PrivateRoute path='/dashboard' component={Dashboard} />
                <Route render={() => {
                        if(isAuth){
                            return(<Redirect to="/dashboard" />)
                        } else {
                            return (<Redirect to="/lobby" />)
                        }
                    }} />
            </Switch>
            <SnackBar
                snackBar={snackBar}
                setSnackBar={setSnackBar}
                hide={2000}
            />
        </>
    )
}

export default Home;