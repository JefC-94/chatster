/* import axios from 'axios';

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/messaging-app/server' : 'https://chatster.be/server';

export const Axios = axios.create({
    baseURL: baseUrl
}); */

//IMG PATH ON LOCALHOST AND PRODUCTION ENV, at this time the same as baseUrl but it might change so keep separate variable

//export const imgPath = process.env.NODE_ENV === 'development' ? '/server/uploads' : 'https://chatster-production.herokuapp.com/server/uploads';
//export const imgPath = '/server/uploads';
export const imgPath = process.env.CLOUDINARY_PATH;