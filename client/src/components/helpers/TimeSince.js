// TIME FUNCTIONS:

/**
 * In the database we save the amount of seconds past since 1 jan 1970.
 * Here we calculate difference between timestamp and now
 * 
 */

// This function is used with contacts, to see how long users have been friends.
export function timeSinceRel(input) {
    let timeStamp = new Date(input * 1000);
    let now = new Date();
    let secondsPast = ((now.getTime() - timeStamp) / 1000);
    let nowDate = now.getDate();

    if (secondsPast < 60) {
        return 'just now';
    }
    if (secondsPast < 3600) {
        let addedMin = secondsPast < 120 ? ' minute ago' : ' minutes ago';
        return parseInt(secondsPast / 60) + addedMin;
    }
    if (nowDate === timeStamp.getDate()) {
        let addedHr = secondsPast < 7200 ? ' hour ago' : ' hours ago';
        return parseInt(secondsPast / 3600) + addedHr;
    }
    if (nowDate !== timeStamp.getDate()) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() === now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
    }
}

// change function so that if it's the previous day (not a full day diff), it shows that day!!
export function timeSinceAbs(input) {
    let timeStamp = new Date(input * 1000);
    let now = new Date();
    let minutes = timeStamp.getMinutes() >= 10 ? timeStamp.getMinutes() : "0" + timeStamp.getMinutes();
    let hour = timeStamp.getHours() >= 10 ? timeStamp.getHours() : "0" + timeStamp.getHours();
    let nowDate = now.getDate();

    if (nowDate === timeStamp.getDate()){
        return hour + ":" + minutes;
    }
    if (nowDate !== timeStamp.getDate()) {
        //let minutes = timeStamp.getMinutes() >= 10 ? timeStamp.getMinutes() : "0" + timeStamp.getMinutes();
        //let hour = timeStamp.getHours() >= 10 ? timeStamp.getHours() : "0" + timeStamp.getHours();
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() === now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year + " at " + hour + ":" + minutes;
    }
}

export function timeSinceAbsWithDay(input) {
    let timeStamp = new Date(input * 1000);
    let minutes = timeStamp.getMinutes() >= 10 ? timeStamp.getMinutes() : "0" + timeStamp.getMinutes();
    let hour = timeStamp.getHours() >= 10 ? timeStamp.getHours() : "0" + timeStamp.getHours();
    let nowDate = new Date().getDate();

    if (nowDate === timeStamp.getDate()){
        return "Today at " + hour + ":" + minutes;
    }

    if (nowDate !== timeStamp.getDate()) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        return day + " " + month + " at " + hour + ":" + minutes;
    }
}

//This function is used on the Convs list items
export function timeSinceConvs(input){

    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    let timeStamp = new Date(input * 1000);
    let now = new Date();
    let minutes = timeStamp.getMinutes() >= 10 ? timeStamp.getMinutes() : "0" + timeStamp.getMinutes();
    let hour = timeStamp.getHours() >= 10 ? timeStamp.getHours() : "0" + timeStamp.getHours();
    let nowDate = now.getDate();

    if (nowDate === timeStamp.getDate()){
        return hour + ":" + minutes;
    }

    if(nowDate - timeStamp.getDate() === 1){
        return "yesterday"; 
    }

    if(nowDate - timeStamp.getDate() === 2){
        return days[timeStamp.getDay()];
    }

    if(nowDate !== timeStamp.getDate()){
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() === now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + " " + year;
    }
}

export function timeSinceSignup(input){
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    let timeStamp = new Date(input * 1000);
    let now = new Date();
    let nowDate = now.getDate();

    if (nowDate === timeStamp.getDate()){
        return "today";
    }

    if(nowDate - timeStamp.getDate() === 1){
        return "yesterday"; 
    }

    if(nowDate - timeStamp.getDate() === 2){
        return days[timeStamp.getDay()];
    }

    if(nowDate !== timeStamp.getDate()){
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() === now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + " " + year;
    }
}