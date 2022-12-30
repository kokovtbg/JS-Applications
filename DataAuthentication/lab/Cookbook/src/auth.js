const loginInput = document.querySelector("input[value='Login']");
loginInput.addEventListener('click', onLogin);

async function onRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('http://localhost:3030/users/register', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
}

async function onLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target.parentElement);
    const {email, password} = Object.fromEntries(formData.entries());
    const response = await fetch('http://localhost:3030/users/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email, password})
    })
    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);

    window.location.href = 'index.html';
}

async function onLogout() {
    const token = sessionStorage.getItem('accessToken');
    return await fetch('http://localhost:3030/users/logout', {
        method: 'get',
        headers: {'X-Authorization': token}
    });
}

async function getCreateRecipe() {
    await fetch('http://localhost:3030/data/recipes', {
        method: 'get',
        headers: {'X-Authorization': authToken}
    })
}

async function createRecipe(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('http://localhost:3030/data/recipes', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': authToken
        },
        body: JSON.stringify(formData)
    })
}
