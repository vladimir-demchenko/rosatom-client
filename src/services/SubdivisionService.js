import http from "../http-common";

const getAll = () => {
    return http.get("/subdivision")
};



const SubdivisionService = {
    getAll,
};

export default SubdivisionService;