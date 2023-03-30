import http from "../http-common";

const getAll = () => {
    return http.get("/resource")
};

const update = (id, data) => {
    return http.put(`/resource/${id}`, data);
};

const create = (data) => {
    return http.post(`/resource`, data);
};

const deleteResource = (id) => {
    return http.delete(`/resource/${id}`);
};

const ResourceService = {
    getAll,
    update,
    create,
    deleteResource
};

export default ResourceService;