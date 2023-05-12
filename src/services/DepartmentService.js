import http from "../http-common";

const getAll = () => {
    return http.get("/department")
};



const DepartmentService = {
    getAll,
};

export default DepartmentService;