import http from "../http-common";

const getText = () => {
    return http.get("/article")
};

const update = (id, data) => {
    return http.put(`/article/${id}`, data);
};



const ArticleService = {
    getText,
    update,
};

export default ArticleService;