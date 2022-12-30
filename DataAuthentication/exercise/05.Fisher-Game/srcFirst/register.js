document.getElementById('register-form').addEventListener('click', registerhandler);
document.querySelectorAll('a').forEach(x => x.classList.remove('active'));
document.getElementById('register').classList.add('active');
document.getElementById('user').style.display = 'none';
const errorP = document.querySelector('p.notification');

function registerhandler(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const {email, password, rePass} = Object.fromEntries(formData.entries());
    
    if(password !== rePass) {
        errorP.textContent = 'Error';
        setTimeout(() => {
            errorP.textContent = '';
        }, 1000);
    }
    
    onRegister(email, password);
}

async function onRegister(email, password) {

    const url = 'http://localhost:3030/users/register';

    const body = {
        email,
        password
    }
    const header = getHeader('post', body);
    try {
        const response = await fetch(url, header);
        const data = await response.json();
        if (data.code && data.code !== 200) {
            throw new Error(data.message);
        }
        sessionStorage.setItem('userData', JSON.stringify({
            email: data.email,
            accessToken: data.accessToken,
            id: data._id
        }))
        window.location = './index.html';
        return data;
    } catch(e) {
        errorP.textContent = e;
        setTimeout(() => {
            errorP.textContent = '';
        }, 1000)
    }
    
    

}

function getHeader(method, body) {
    return {
        method: `${method}`,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }
}