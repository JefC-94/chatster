import React from 'react';
import {Link} from 'react-router-dom';

function About() {
    return (
        <main className="about-main container">
            <div className="about-container">
                <h1>Over dit project</h1>
                <div className="about-block">
                    <p>
                        Deze chat-applicatie werd ontworpenen en ontwikkeld door Jef Ceuppens, als eindwerk voor de opleiding Front End Developer bij Syntra AB.
                    </p>
                    <p>
                        De applicatie werd ontwikkeld met React, in combinatie met scss voor de layout.
                    </p>
                    <p>
                        Omdat dit project op de front-end en niet zozeer op back-end gefocust is, heb ik realtime chatten tussen gebruikers en meldingen van nieuwe berichten voorlopig nog niet gerealiseerd. Ik ben op dit moment me aan het verdiepen in php sockets en hoop dit zo snel mogelijk te kunnen integreren.
                    </p>
                </div>
                
                <div className="about-block">
                    <p>
                        Begeleider: David Verhulst
                    </p>
                </div>
                <div className="about-block">
                    <p>
                        De backend werd gebaseerd op volgende open-source code (en lichtelijk aangepast naar de noden van dit project):
                    </p>
                    <ul>
                        <li><a className="link" href="https://github.com/mevdschee/php-crud-api" target="_blank" rel="noreferrer">PHP-CRUD-API</a> door mvedschee</li>
                        <li><a className="link" href="https://www.w3jar.com/php-login-and-registration-restful-api/" target="_blank" rel="noreferrer">PHP Login system</a> door w3jar</li>
                    </ul> 
                </div>
                <div className="about-block">

                </div>
            
                <div className="back">
                    <Link className="link" to='/'>Terug naar Chatster</Link> {/* This will return to dashboard when logged in */}
                </div>
            
            </div>
        </main>
    )
}

export default About
