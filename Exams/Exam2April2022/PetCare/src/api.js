const host = 'http://localhost:3030/';

export async function requester(method, url, body) {
    const object = {
        method: method,
        headers: {}
    }
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        object.headers['X-Authorization'] = token;
    }
    if (body) {
        object.headers['Content-Type'] = 'application/json';
        object.body = JSON.stringify(body);
    }
    const response = await fetch(host + url, object);
    return response;
}