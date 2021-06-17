import React from 'react'

function OnlineIcon({size, right, bottom}) {
    return (
        <span className="online-icon"
            style={{
                height:size,
                width:size,
                right: right,
                bottom :bottom
            }}
        ></span>
    )
}

export default OnlineIcon
