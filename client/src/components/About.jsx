import React from 'react';
import {Link} from 'react-router-dom';

function About() {
    return (
        <main className="about-main container">
            <div className="about-container">
                <h1>Over dit project</h1>
                <div className="about-block">
                    <p>
                        Deze chat-applicatie werd ontworpen en ontwikkeld door Jef Ceuppens, als eindwerk voor de opleiding Front-End Developer bij Syntra AB.
                    </p>                    
                </div>

                <div className="about-block">
                    <p>
                        De front-end van de applicatie werd volledig ontwikkeld in React. Voor de layout werd SCSS gebruikt.
                    </p>
                </div>

                <div className="about-block">
                    <p>
                        De back-end werd ontwikkeld in NodeJS. De authenticatie gebeurt via een JWT-token. Om realtime chatberichten te ontvangen werd een socket gebouwd met de socket-io bibliotheek. De API werd gebouwd met Express en Knex. 
                    </p>
                </div>
                
                <div className="about-block">
                    <p>
                        Begeleider: David Verhulst
                    </p>
                </div>
                
                
            
                <div className="back">
                    <Link className="link" to='/'>Terug naar Chatster</Link> {/* This will return to dashboard when logged in */}
                </div>
            
            </div>
        </main>
    )
}

export default About
