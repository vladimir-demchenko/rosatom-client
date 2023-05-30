import axios from "axios";

export default axios.create({
    baseURL: 'http://81.163.29.42:8080/api',
    headers: {
        "Content-type": "application/json"
    }
});