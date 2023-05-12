import http from "../http-common";

const getAll = () => {
    return http.get("/system")
};


const SystemService = {
    getAll,
};

export default SystemService;