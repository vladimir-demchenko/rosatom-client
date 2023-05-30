import axios from "axios";

export default axios.create({
    baseURL: 'http://82.148.30.227:8080/api',
    headers: {
        "Content-type": "application/json"
    }
});