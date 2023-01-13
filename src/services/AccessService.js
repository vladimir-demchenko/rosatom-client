import http from "../http-common";

const getAll = () => {
    return http.get("/access")
};


const AccessSevice = {
    getAll
};

export default AccessSevice;