import http from "../http-common";

const getAll = () => {
    return http.get("/users")
};

const update = (id, data) => {
    return http.put(`/users/${id}`, data);
};

const create = (data) => {
    return http.post(`/users`, data);
}

const UserService = {
    getAll,
    update,
    create

};

export default UserService;