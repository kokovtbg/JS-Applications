import { request } from "../helpers/httpReques.js";

export async function onSubmit(data, id){
    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
    const dateAndTime = `${date} ${time}`; 
    const body = JSON.stringify({
        postText: data.get('postText'),
        username: data.get('username'),
        dateAndTime: dateAndTime,
        postId: id
    });
    let url = `http://localhost:3030/jsonstore/collections/myboard/comments`;
    return await request(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body
    });


}