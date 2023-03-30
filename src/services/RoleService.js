import http from "../http-common";

const getAll = () => {
    return http.get("/role")
};

const update = (id, data) => {
    return http.put(`/role/${id}`, data);
};

const create = (data) => {
    return http.post(`/role`, data);
};

const deleteRole = (id) => {
    return http.delete(`/role/${id}`);
};

const RoleService = {
    getAll,
    update,
    create,
    deleteRole
};

export default RoleService;