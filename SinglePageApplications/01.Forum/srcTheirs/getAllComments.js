import { request } from "../helpers/httpReques.js";

export async function getComments(id){
    let url = `http://localhost:3030/jsonstore/collections/myboard/comments`;
    let responese =  await request(url)
    let comments = Object.values(responese).filter(({postId}) => postId === id);
    return comments
}