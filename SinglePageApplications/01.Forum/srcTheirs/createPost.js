import { request } from '../helpers/httpReques.js';


export  async function onSubmit(data){
    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
    const dateAndTime = `${date} ${time}`;
    const body = JSON.stringify({
        topicName: data.get('topicName'),
        username: data.get('username'),
        postText: data.get('postText'),
        dateAndTime: dateAndTime,
    });
    let url = 'http://localhost:3030/jsonstore/collections/myboard/posts'
    return await request(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body
    });

}