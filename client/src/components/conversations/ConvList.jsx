import React, {useContext} from 'react';
import { ConvContext } from '../../contexts/ConvContext';
import ConvItem from './ConvItem';

function ConvList() {

    //CONTEXTS
    const {convs, loading} = useContext(ConvContext);

    /**
     * Note on the sorting of these items:
     * The conversations are sorted by last-message, except for those who do not have a last message -> creation of conversation moment
    */

    return (
        <div className="convs-list">
            {(loading.single || loading.group) && <div className="navigation navigation-center">Loading...</div>}
            {
            (!loading.single && !loading.group && convs.length > 0) &&
            convs.sort((a, b) => {
                    return (b.lastMessage ? b.lastMessage.created_at : b.created_at) - (a.lastMessage ? a.lastMessage.created_at : a.created_at)
                })
                .map(conv => {
                    return <ConvItem key={conv.id} conv={conv} />;
                })
            }
            {
            (!loading.single && !loading.group && convs.length === 0) && 
                <div className="no-results convs-tab">
                    <p className="">You have no conversations yet. Go to contacts and invite some people to chat.</p>
                </div>
            }
        </div>
    )
}

export default ConvList
