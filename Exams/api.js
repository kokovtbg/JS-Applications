const host = 'http://localhost:3030/';

export async function requester(method, url, body) {
    const object = {
        method: method,
        headers: {}
    }
    if (body) {
        object.headers['Content-Type'] = 'application/json';
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            object.headers['X-Autorization'] = token;
        }
        object.body = JSON.stringify(body);
    }
    const response = await fetch(host + url, object);
    const data = await response.json();
    return data;
}