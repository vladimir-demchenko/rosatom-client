import http from "../http-common";

const getAll = () => {
    return http.get("/user")
};

const update = (id, data) => {
    return http.put(`/user/${id}`, data);
};

const create = (data) => {
    return http.post(`/user`, data);
};

const deleteUser = (id) => {
    return http.delete(`/user/${id}`);
};

const UserService = {
    getAll,
    update,
    create,
    deleteUser
};

export default UserService;