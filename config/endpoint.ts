const config ={
    USER_ENDPOINT:{
        GET_USER_BY_ID:"/users/:id",
        CREATE_USER:"/users",   
        LOGOUT_USER:"/users/logout",
        UPDATE_USER_BY_ID:"/users/:id",
        UPDATE_CURRENT_USER:"/users/me",
        DELETE_USER_BY_ID:"/users/:id",
        SEARCH_USERS:"/users/search",
        GET_CURRENT_USER:"/users/me",
        GET_ALL_USERS:"/users",
        LOGIN_USER:"/users/login",
        VERIFY_USER_EMAIL:"/users/verify"
    }
}

export default config