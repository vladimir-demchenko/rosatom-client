import http from "../http-common";

const getAll = () => {
    return http.get("/access")
};

const update = (id, data) => {
    return http.put(`/access/${id}`, data);
};

const create = (data) => {
    return http.post(`/access`, data);
};

const deleteAccess = (id) => {
    return http.delete(`/access/${id}`);
};

const AccessService = {
    getAll,
    update,
    create,
    deleteAccess
};

export default AccessService;