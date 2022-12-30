const body = document.querySelector('body');
const nav = document.querySelector('nav');
const dashbordHolder = document.getElementById('dashboard-holder');
const divs = document.querySelectorAll('div.container.home.wrapper');
const homeDiv = divs[0];
const divDetails = document.querySelector('div.container.home.some');
divDetails.remove();


const email = localStorage.getItem('email');

let listItemsNav = Array.from(document.querySelectorAll('nav ul li'));

const dashboard = listItemsNav[0].querySelector('a');
dashboard.addEventListener('click', loadDashboard);

const itemDashboard = document.querySelector('nav div.container a');
itemDashboard.addEventListener('click', loadDashboard);

if (email) {
    listItemsNav[3].style.display = 'none';
    listItemsNav[4].style.display = 'none';
    divs.forEach(d => d.remove());    
} else {
    listItemsNav[1].style.display = 'none';
    listItemsNav[2].style.display = 'none';
    dashbordHolder.remove();
    divs.forEach((d, i) => {
        if (i !== 0) {
            d.remove();
        }
    });
}

const registerButton = document.querySelectorAll('nav ul li')[4].querySelector('a');
registerButton.addEventListener('click', register);

const loginButton = document.querySelectorAll('nav ul li')[3].querySelector('a');
loginButton.addEventListener('click', login);

const logoutButton = document.querySelectorAll('nav ul li')[2].querySelector('a');
logoutButton.addEventListener('click', logout);

const createButton = document.querySelectorAll('nav ul li')[1].querySelector('a');
createButton.addEventListener('click', create);

function loadDashboard(e) {
    e.preventDefault();
    showIdeas();
    body.replaceChildren(dashbordHolder);
    body.prepend(nav);
}

function register(e) {
    e.preventDefault();
    const registerSection = divs[1];
    body.replaceChildren(registerSection);
    body.prepend(nav);

    registerSection.querySelector('form').addEventListener('submit', onRegister);
    
}

async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input');
    if (inputs[0].value.length < 3 || inputs[1].value.length < 3 
        || inputs[1].value !== inputs[2].value) {
        return;
    }
    const formData = new FormData(form);
    const bodyToRegister = Object.fromEntries(formData);
    delete bodyToRegister.repeatPassword;
    const url = 'http://localhost:3030/users/register';
    const response = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bodyToRegister)
    });
    const data = await response.json();

    localStorage.setItem('email', data.email);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('id', data._id);
    
    showIdeas();
    body.replaceChildren(dashbordHolder);
    body.prepend(nav);

    listItemsNav[3].style.display = 'none';
    listItemsNav[4].style.display = 'none';
    listItemsNav[1].style.display = 'inline';
    listItemsNav[2].style.display = 'inline';

    return data;
}

function login(e) {
    e.preventDefault();
    const loginSection = divs[2];
    body.replaceChildren(loginSection);
    body.prepend(nav);

    loginSection.querySelector('form').addEventListener('submit', onLogin);
    
}

async function onLogin(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const bodyToLogin = Object.fromEntries(formData);
    const url = 'http://localhost:3030/users/login';
    const response = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bodyToLogin)
    })
    const data = await response.json();

    localStorage.setItem('email', data.email);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('id', data._id);

    form.querySelectorAll('input').forEach(i => i.value = '');
    showIdeas();
    body.replaceChildren(dashbordHolder);
    body.prepend(nav);

    listItemsNav[3].style.display = 'none';
    listItemsNav[4].style.display = 'none';
    listItemsNav[1].style.display = 'inline';
    listItemsNav[2].style.display = 'inline';

    return data;
}

async function logout(e) {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const url = 'http://localhost:3030/users/logout';
    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': JSON.stringify(token)
        }
    })
    const data = await response.json();
    
    localStorage.clear();
    listItemsNav[3].style.display = 'inline';
    listItemsNav[4].style.display = 'inline';
    listItemsNav[1].style.display = 'none';
    listItemsNav[2].style.display = 'none';
    body.replaceChildren(homeDiv);
    body.prepend(nav);
    
    return data;
}

async function showIdeas() {
    const url = 'http://localhost:3030/data/ideas?select=_id%2Ctitle%2Cimg&sortBy=_createdOn%20desc';
    const response = await fetch(url);
    const data = await response.json();
    const header = dashbordHolder.querySelector('h1');
    dashbordHolder.innerHTML = '';
    if (data.length === 0) {
        dashbordHolder.appendChild(header);
    }
    data.forEach(e => {
        const div = document.createElement('div');
        div.setAttribute('class', 'card overflow-hidden current-card details');
        div.style.width = '20rem';
        div.style.height = '18rem';
        div.innerHTML = 
        `<div class="card-body">
            <p class="card-text">${e.title}</p>
        </div>
        <img class="card-image" src="${e.img}" alt="Card image cap">
        <a class="btn" href="" data-id="${e._id}">Details</a>`;
        div.querySelector('a').addEventListener('click', details);
        dashbordHolder.appendChild(div);
    })
    
    return data;
}

async function details(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const url = `http://localhost:3030/data/ideas/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    divDetails.innerHTML = 
    `<img class="det-img" src="${data.img}" />
    <div class="desc">
        <h2 class="display-5">${data.title}</h2>
        <p class="infoType">Description:</p>
        <p class="idea-description">${data.description}</p>
    </div>
    <div class="text-center">
        <a class="btn detb" href="">Delete</a>
    </div>`;
    const aElement = divDetails.querySelector('div a');
    const divDelete = aElement.parentElement;
    data._ownerId === localStorage.getItem('id') 
        ? '' : divDelete.remove();
    aElement.setAttribute('data-id', data._id);
    aElement.addEventListener('click', deleteIdea);
    dashbordHolder.remove();
    body.appendChild(divDetails);
    
    return data;
}

async function deleteIdea(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const token = localStorage.getItem('accessToken');
    const url = `http://localhost:3030/data/ideas/${id}`;
    const response = await fetch(url, {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json', 
            'X-Authorization': token
        }
    })
    const data = await response.json();
    
    divDetails.remove();
    showIdeas();
    body.appendChild(dashbordHolder);

    return data;
}   

function create(e) {
    e.preventDefault();
    const createForm = divs[3];
    body.replaceChildren(createForm);
    body.prepend(nav);
    
    createForm.querySelector('form').addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'http://localhost:3030/data/ideas';
    const token = localStorage.getItem('accessToken');
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const bodyToUpload = {
        title: data.title,
        description: data.description,
        img: data.imageURL
    }
    if (bodyToUpload.title.length < 6 
        || bodyToUpload.description.length < 10 
        || bodyToUpload.img.length < 5) {
        return;
    }
    const response = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json', 
            'X-Authorization': token
        },
        body: JSON.stringify(bodyToUpload)
    });
    const dataFromResponse = response.json();
    
    showIdeas()
    body.replaceChildren(dashbordHolder);
    body.prepend(nav);

    form.querySelectorAll('input').forEach(i => i.value = '');
    
    return dataFromResponse;
}

showIdeas();