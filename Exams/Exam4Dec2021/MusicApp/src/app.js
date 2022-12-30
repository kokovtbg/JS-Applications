import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.getElementById('main-content');
const homeSection = document.getElementById('welcomePage');
const loginSection = document.getElementById('loginPage');
const registerSection = document.getElementById('registerPage');
const dashboard = document.getElementById('catalogPage');
dashboard.innerHTML = '';
const createSection = document.querySelector('.createPage');
const detailsSection = document.getElementById('detailsPage');
detailsSection.innerHTML = '';
const editSection = document.querySelector('.editPage');


document.querySelectorAll('section').forEach(s => s.remove());


const homeButton = document.querySelector('nav a');
homeButton.addEventListener('click', showHome);
const loginButton = document.querySelectorAll('nav ul li a')[2];
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('nav ul li a')[3];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('nav ul li a')[5];
logoutButton.addEventListener('click', logout);
const dashboardButton = document.querySelector('nav ul li a');
dashboardButton.addEventListener('click', showDashboard);
const createButton = document.querySelectorAll('nav ul li a')[4];
createButton.addEventListener('click', create);


function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        createButton.style.display = 'inline';
        logoutButton.style.display = 'inline';
    } else {
        loginButton.style.display = 'inline';
        registerButton.style.display = 'inline';
        createButton.style.display = 'none';
        logoutButton.style.display = 'none';
    }
}

function showHome(e) {
    e ? e.preventDefault() : '';
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(homeSection);
}

function login(e) {
    e.preventDefault();
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(loginSection);
    loginSection.addEventListener('submit', onLogin);
}

async function onLogin(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === '') {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/login', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

    form.reset();
    showHome();
    showNavbar();

    return data;
}

function register(e) {
    e.preventDefault();
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(registerSection);
    registerSection.addEventListener('submit', onRegister);
}

async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === ''
        || object['conf-pass'] !== object.password) {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

    form.reset();
    showHome();
    showNavbar();

    return data;
}

async function logout(e) {
    e.preventDefault();
    const response = await requester('get', 'users/logout');

    sessionStorage.clear();
    showNavbar();
    showHome();
    return response;
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const token = sessionStorage.getItem('accessToken');

    const url = 'data/albums?sortBy=_createdOn%20desc&distinct=name';
    const data = await requester('get', url);
    
    const template = html`
    <h1>All Albums</h1>
    
    ${data.map(a => html`
    <div class="card-box">
        <img src=".${a.imgUrl}">
        <div>
            <div class="text-center">
                <p class="name">Name: ${a.name}</p>
                <p class="artist">Artist: ${a.artist}</p>
                <p class="genre">Genre: ${a.genre}</p>
                <p class="price">Price: $${a.price}</p>
                <p class="date">Release Date: ${a.releaseDate}</p>
            </div>
            ${token ? html`
            <div class="btn-group">
                <a href="#" id="details" @click=${details} id=${a._id} data-id=${a._ownerId}>Details</a>
            </div>` : html``}
        </div>
    </div>`)}
    
    
    <!--No albums in catalog-->
    ${data.length === 0 ? html`<p>No Albums in Catalog!</p>` : html``}`;

    render(template, dashboard);
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(dashboard);
}

function create(e) {
    e.preventDefault();
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/albums';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.name === '' || object.imgUrl === ''
        || object.price === '' || object.releaseDate === ''
        || object.artist === '' || object.genre === ''
        || object.description === '') {
        return;
    }
    const data = await requester('post', url, object);

    showDashboard();
    form.reset();
    return data;
}

async function details(e, ownerId) {
    e.target ? e.preventDefault() : '';
    const id = e.target ? e.target.id : e;
    const idOwner = e.target ? e.target.getAttribute('data-id') : ownerId;
    const currId = sessionStorage.getItem('id');

    const url = `data/albums/${id}`;
    const data = await requester('get', url);
    
    const template = () => html`
    <div class="wrapper">
        <div class="albumCover">
            <img src=".${data.imgUrl}">
        </div>
        <div class="albumInfo">
            <div class="albumText">
    
                <h1>Name: ${data.name}</h1>
                <h3>Artist: ${data.artist}</h3>
                <h4>Genre: ${data.genre}</h4>
                <h4>Price: $${data.price}</h4>
                <h4>Date: ${data.releaseDate}</h4>
                <p>Description: ${data.description}</p>
            </div>
    
            <!-- Only for registered user and creator of the album-->
            ${idOwner === currId ? html`
            <div class="actionBtn">
                <a href="#" class="edit" @click=${edit} data-id=${data._id}>Edit</a>
                <a href="#" class="remove" @click=${deleteItem} data-id=${data._id}>Delete</a>
            </div>` : html``}
        </div>
    </div>`;


    render(template(), detailsSection);
    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(detailsSection);

    return data;
}

async function edit(e) {
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    const url = `data/albums/${id}`;
    const data = await requester('get', url);
    
    const name = editSection.querySelectorAll('input')[0];
    const imgUrl = editSection.querySelectorAll('input')[1];
    const price = editSection.querySelectorAll('input')[2];
    const releaseDate = editSection.querySelectorAll('input')[3];
    const artist = editSection.querySelectorAll('input')[4];
    const genre = editSection.querySelectorAll('input')[5];
    const description = editSection.querySelector('textarea');

    name.value = data.name;
    imgUrl.value = data.imgUrl;
    price.value = data.price;
    releaseDate.value = data.releaseDate;
    artist.value = data.artist;
    genre.value = data.genre;
    description.value = data.description;

    document.querySelectorAll('section').forEach(s => s.remove());
    main.appendChild(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/albums/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.name === '' || object.imgUrl === ''
        || object.price === '' || object.releaseDate === ''
        || object.artist === '' || object.genre === ''
        || object.description === '') {
        return;
    }
    const data = await requester('put', url, object);

    details(id, data._ownerId);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const isConfirm = confirm("Press a button!");
    if (isConfirm) {
        const id = e.target.getAttribute('data-id');
        const url = `data/albums/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }
}

showHome();
showNavbar();