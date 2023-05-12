import http from "../http-common";

const getAll = () => {
    return http.get("/position")
};



const PositionService = {
    getAll,
};

export default PositionService;