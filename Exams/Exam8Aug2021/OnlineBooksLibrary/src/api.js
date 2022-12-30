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
    try {
        const response = await fetch(host + url, object);

        if (response.status == 204) {
            return response;
        }

        const result = await response.json();

        if (response.ok == false) {
            throw new Error(response.message);
        }
        return result;
    } catch(err) {
        alert(err.message);
        throw err;
    }
}