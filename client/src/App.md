# Chatster Documentation File

This is the documentation file for Chatster - the Messaging app

Chatster is a user-based app where users can invite others to chat, and also setup group conversations.


## Directories setup

The project is build in React using create-react-app.

The root directory consists of two main directories:

Client - React App
Server - Backend PHP Server for Authentication and Database Connection

The Client contains all of the front-end code, including static images and scss styling.

The Server is a PHP custom built series of API Endpoints, used for authentication and database connection. 

It is possible that in the future I'll change the server to node.js.


## Project setup : routes

The project is built around three main routes:

Lobby / The default route for new visitors, where users can login and register
About / The route for the about page, which has some info about the project

Dashboard / This is the private route for logged-in users. Users who are logged in will always be redirected to this route. The route contains different subroutes for the different modules of the chat applications.

The file structure that sets these routes up is the following:

App.js - this file has two components:
    AppWrapper : highest component, which wraps the WindowContextProvider around the App component, so that the App can use the WindowContext
    App : the second highest component, which wraps User and Modal Context Providers around the Home + Footer components + also sets up BrowserRouter

Home.js - this file handles the main routes: Lobby, About and Dashboard + adds SnackBar

Lobby.jsx - this file shows the welcoming page and either the login or register component

Dashboard.jsx - this file is the base page for users. It shows:
    Header - the header component is constant accross all dashboard subroutes
    Different Routes:
        - Conversations
        - Contacts
        - Profile
        - Group Create and Group Update
        (see further for these routes in detail)
    It also sets up the Conv and Contact Context Providers


## Project setup: Constants.js

Before I explain the contexts, a quick explanation of the Constants.js file.

This is a small file in the Components directory, and it contains an Axios Object with the basic configuration for the Development/Production API baseUrl. It is configured so that the development environment is detected automatically and works standard on local and remote.

The image path is defined as a constant here as well.


## Project setup: Contexts

Most of the logic regarding conversations, users and contacts is placed in contexts, so that it this information can be used in multiple components.

 - UserContext.js
    This file handles the authorization on the front-end. It exports the following important objects and functions, and is being used in other contexts as well as a lot of Components.

    - "isAuth" boolean and "theUser" object, both as a state variable. The current user will always be saved in the "theUser" object when logged in

    - loginUser, logoutUser, registerUser and edituser functions. All these functions call different Axios requests to the respective API endpoints.

    - isLoggedIn function. This function checks whether a user is logged in based on the localStorage. This function is called when visiting the app, to keep a user logged in accross sessions.

 - ContactContext.js
    This file handles all of the contacts logic. It keeps track of the users contacts and "otherusers" => users that are not accepted, requested or pending contacts of this user.

    A state [contacts, setContacts] with an array for each contact status: accepts, pendings, rejects, requests.

    The useSWR "data" and "error" objects, which we use to setup the contacts state. A useEffect calls the getContacts() method, which divides all contacts over the different arrays (this is called every time "data" updates).

    The useSWR "usersdata" and "userserror" (also: usersurl) keeps track of the otherUsers. This data is mutated after every request that changes this array.

    All the different functions are exported here as well: sendRequest, sendAcceptedRequest, acceptRequest, rejectRequest, cancelRequest, blockContact, deleteContact. They all use a different Axios call to the respective endpoint. Because of the link between contacts and conversations, a lot of the create, update and delete logic for conversations also sits in these functions.

 - ConvContext.js
    This file handles the logic of getting all individual and group conversations and preparing them for the Components. The two different types on convs are separately requested, and afterwards put together in one state: convs.

    Individual convs:
        "data" is the object that contains the individual conversations. A function "getConvs" is being called everytime this updates, and it adds these conversations to the "convs" state array. It also adds an "otherUser", "displayName" and "imageUrl" to every individual conversation object, to make it easier in the Components.

    Group convs:
        "groupdata" is the object that contains the group conversations. Similarly, a function "getGroupConvs" is being called everytime this updates, and it also adds these conversations to the "convs" state array. Instead of an "otherUser", a "userNames" property is added to every single conversation, which is a string of the different users in this conversation. A "displayName" and "imageUrl" are also added as props.

    All of these are exported, because mutation of these urls/data is sometimes necessary in other components.

 - ModalContext.js
    This is a very small context file that exports a state for the SnackBar component in the Home Component. By default, this snackbar is hidden and has no message, but different components can use the setSnackBar method to show this Component at the bottom of the screen. It automatically hides after 2s.

    The snackbar component itself is found in components/ui/SnackBar.jsx

 - WindowContext.js
    The windowContext keeps track of the windowWidth. Both the windowWidth and the changeWindowWidth are exported here, but changeWindowWidth is only used in the App.js component, where an event listener is added that updates the windowWidth on resizing. The windowWidth state variable can be used in every Component that needs it.

 - SocketContext.js
    The socket context is a file that was created during the attempt of setting up sockets, but has not been used for some time.


## Dashboard Routes

The dashboard is the central place for all subroutes that require a user to be logged in.

The subroutes are always linked to components:

    - conversations
        This is the main component for the conversations overview, with a list of all conversations and a detail conversation on the right side of the screen

    - contacts
        This is the main component for the contacts overview, with the different kinds of contacts displayed in different separate components

    - profile
        In this component, the user can edit his username, password, and profile picture

    - createGroupConv
        Here a user can create a new Group Chat and invite other users to it.

    - updateGroupConv
        Here a user can update an existing Group Chat, delete users from it, add new contacts to it, and edit the group chat picture.


## Conversations

The main component for the conversations-module is the Conversations.jsx in the dashboard folder. This component works closely together with the ConvContext for its data.

The Conversations.jsx component has two main functions:

    - it sets up a "currentConv": either by ID (routes) or by default it sets up one conversations as the current active conversation to display on the right.

    - it sets up the conversations components depending on screen width: either both the convList and Conversation component, or just one of them.

    Important: the currentConv is a being requested separately from the convs. This is to make sure that separate refresh is possible, and no conflicts arise.

The Conversations.jsx makes use of the following components:

 - ConvList.jsx - displays an array of all conversations, and handles empty array
 - ConvItem.jsx - is used in the ConvList map


A single conversation is displayed by the Conversation.jsx component

The Conversation.jsx component carries a lot of logic. The main functions are:

    - it receives the currentConv as conv from the parent component and displays all the info

    - it uses useSWRInfitine to gradually fetch all the messages (with load more functionality): data, messMutate
    
    - all messages are given extra properties for optimal display (datetime, image, sentBy, ...). See the SetPropertiesForMessages function

    - it keeps track of the events being fired to scroll to the right place in the conversation
        - firstrender, newmessage -> scrollToBottom
        - loadmore -> keep scroll level on this point in the conv

The ConvForm.jsx component displays the text input field below the conversation. It was separated because the handleFormSubmit function is very large. This function also contains some leftover logic from the first socket implementation, and it might be reused again when we are able to add socket functionality.

The message component contains little logic. It makes use of the properties being set in the Conversation component to display messages with the right information.

For the C(R)UD of a Group Conversation, two component have been made. Both of these components use the contact, conv, user and modalContexts for logic:

- CreateGroupConv.jsx: this component displays a form with a list of contacts that the user can add to the groupConv. The user can also choose a name.

- UpdateGroupConv.jsx: this component displays a form based on the conversation that is being updated, and this time the user can see the contacts already in the conv (and remove them), and also add new contacts. He can change the name of the conv + he can update the group picture. The user can also delete this conversation.


## Contacts

The main component for the Contactsmodule is the Contacts.jsx in the dashboard folder. This component holds no actual data and carries very little logic. Its main functions are:

    - display the contact tabs depending on screen size:
        - small: one tab visible, navigation visible
        - medium: two columns, otherUsers with a show/hide button
        - large: three columns, all tabs visible

    - it has two states: the activeTab (only used on smallsreen) and the showUsers (only used on medium screen)

    - it passes the optional id received from the route to the accepts tab.

The Accepts.jsx shows the different accepted contacts. It alsof has some other functions:

    - it shows the details of a selected contact. [selectedContact, setSelectedContact]. A seperate axios request is called for this detail

    - Because of some extended logic, every accepted contact is being displayed in an Accept.jsx component. Here the setSelectedContact function is being called onClick and the showOptions logic is implemented for the action buttons.

The Pendings.jsx, Requests.jsx, Rejects.jsx and Users.jsx carry no logic. They use the contactContext for the functions and data they need, and display the correct users. Rejects.jsx is currently not even shown to the user.

The NavButton component renders the tab buttons on small screen.


## Login, Register Components

The Lobby shows the Login Component by default, and the visitor can switch to the Register Component.

The Login.js component shows the loginform, and uses the UserContext exports for its logic. Same goes for the Register.js component.

Error handling in both components consists of an error state, this error has type and message properties: type determines where the error will be shown, and message is the displayed error message.