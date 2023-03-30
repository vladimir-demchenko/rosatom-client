import http from "../http-common";

const getAll = () => {
    return http.get("/is")
};

const update = (id, data) => {
    return http.put(`/is/${id}`, data);
};

const create = (data) => {
    return http.post(`/is`, data);
};

const deleteIS = (id) => {
    return http.delete(`/is/${id}`);
};

const IsService = {
    getAll,
    update,
    create,
    deleteIS
};

export default IsService;