const host = 'http://localhost:3030/';

async function request(url, options) {
    try {
        const response = await fetch(host + url, options);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message);
        }
        try {
            if (response.status === 204) {
                return response;
            }
            const data = response.json();
            return data;
        } catch (error) {
            alert(error.message);
            return error;
        }
    } catch(error) {
        alert(error.message);
        return error;
    }
}

function getOption(method, body) {
    const options = {
        method,
        headers : {}
    }

    const user = JSON.parse(sessionStorage.getItem('userData'));
    const token = user && user.accessToken;
    if (token) {
        options.headers['X-Authorization'] = token;
    }

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    return options;
}

export async function get(url) {
    return await request(url, getOption('get'));
}   

export async function post(url, data) {
    return await request(url, getOption('post', data));
}

export async function put(url, data) {
    return await request(url, getOption('put', data));
}

export async function del(url) {
    return await request(url, getOption('delete'));
}