import React from 'react'

function Rejects({rejects}) {

    return (
        <div className="rejects">
            <h4>Rejects</h4>
            <ul>
            {rejects && rejects.map(reject => {
                return (
                <li key={reject.id}>
                    <p>{reject.otherUser.username}</p>
                </li>
                )
            })}
            </ul>
        </div>
    )
}

export default Rejects
