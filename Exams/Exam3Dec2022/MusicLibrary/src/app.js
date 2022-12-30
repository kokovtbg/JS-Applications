import { html, render } from "../../../../../node_modules/lit-html/lit-html.js";
import { requester } from "./api.js";

let main = document.querySelector('main');
const homeSection = document.getElementById('home');
const registerSection = document.getElementById('register');
const loginSection = document.getElementById('login');
const dashboard = document.getElementById('dashboard');
dashboard.innerHTML = '';
const createSection = document.getElementById('create');
const detailsSection = document.getElementById('details');
detailsSection.innerHTML = '';
const editSection = document.getElementById('edit');


Array.from(document.querySelectorAll('section')).forEach(s => s.remove());


const logo = document.getElementById('logo');
logo.addEventListener('click', showHome);
const loginButton = document.querySelector('nav div.guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('nav div.guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('nav div.user a')[1];
logoutButton.addEventListener('click', logout);
const dashboardButton = document.querySelector('nav div a');
dashboardButton.addEventListener('click', showDashboard);
const createButton = document.querySelector('nav div.user a');
createButton.addEventListener('click', create);

function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        document.querySelector('nav div.user').style.display = 'inline';
        document.querySelector('nav div.guest').style.display = 'none';
    } else {
        document.querySelector('nav div.user').style.display = 'none';
        document.querySelector('nav div.guest').style.display = 'inline';
    }
}

function showHome(e) {
    e ? e.preventDefault() : '';
    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(homeSection);
}

function login(e) {
    e.preventDefault();
    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
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
    showDashboard();
    form.reset();
    showNavbar();

    return data;
}

function register(e) {
    e.preventDefault();
    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(registerSection);
    registerSection.addEventListener('submit', onRegister);
}

async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === ''
        || object['re-password'] !== object.password) {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    showDashboard();
    form.reset();
    showNavbar();

    return data;
}

async function logout(e) {
    e.preventDefault();
    const response = await requester('get', 'users/logout');

    sessionStorage.clear();
    showNavbar();
    showDashboard();
    return response;
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/albums?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    const tempate = html`
    <h2>Albums</h2>
    <ul class="card-wrapper">
        <!-- Display a li with information about every post (if any)-->
        ${data.map(e => html`
        <li class="card">
            <img src=".${e.imageUrl}" alt="travis" />
            <p>
                <strong>Singer/Band: </strong><span class="singer">${e.singer}</span>
            </p>
            <p>
                <strong>Album name: </strong><span class="album">${e.album}</span>
            </p>
            <p><strong>Sales:</strong><span class="sales">${e.sales}</span></p>
            <a class="details-btn" href="" @click=${details} id=${e._id} data-id=${e._ownerId}>Details</a>
        </li>`)}
    
    
    </ul>
    
    <!-- Display an h2 if there are no posts -->
    ${data.length === 0 ? html`<h2>There are no albums added yet.</h2>` : html``}`;

    render(tempate, dashboard);


    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(dashboard);
}

function create(e) {
    e.preventDefault();
    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/albums';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.singer === '' || object.album === ''
        || object.imageUrl === '' || object.release === ''
        || object.label === '' || object.sales === '') {
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

    const urlTotalLikes = `data/likes?where=albumId%3D%22${id}%22&distinct=_ownerId&count`;
    const dataTotalLikes = await requester('get', urlTotalLikes);

    const urlTotalLikeUser = `data/likes?where=albumId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const dataTotalLikesUser = await requester('get', urlTotalLikeUser);

    const template = () => html`
    <div id="details-wrapper">
        <p id="details-title">Album Details</p>
        <div id="img-wrapper">
            <img src=".${data.imageUrl}" alt="example1" />
        </div>
        <div id="info-wrapper">
            <p><strong>Band:</strong><span id="details-singer">${data.singer}</span></p>
            <p>
                <strong>Album name:</strong><span id="details-album">${data.album}</span>
            </p>
            <p><strong>Release date:</strong><span id="details-release">${data.release}</span></p>
            <p><strong>Label:</strong><span id="details-label">${data.label}</span></p>
            <p><strong>Sales:</strong><span id="details-sales">${data.sales}</span></p>
        </div>
        <div id="likes">Likes: <span id="likes-count">${dataTotalLikes}</span></div>
    
        <!--Edit and Delete are only for creator-->
    
        ${currId && idOwner !== currId && dataTotalLikesUser === 0 ? html`
        <div id="action-buttons">
            <a href="" id="like-btn" @click=${like} data-id=${data._id} data-ownerId=${data._ownerId}>Like</a>
        </div>` : html``}
        ${idOwner === currId ? html`
        <div id="action-buttons">
            <a href="" id="edit-btn" @click=${edit} data-id=${data._id}>Edit</a>
            <a href="" id="delete-btn" @click=${deleteItem} data-id=${data._id}>Delete</a>
        </div>` : html``}
    
    </div>`;



    render(template(), detailsSection);
    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(detailsSection);

    return data;
}

async function like(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const url = 'data/likes';
    const object = {
        albumId: id
    }
    const data = await requester('post', url, object);
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/albums/${id}`;
    const data = await requester('get', url);

    const singer = editSection.querySelectorAll('input')[0];
    const album = editSection.querySelectorAll('input')[1];
    const imageUrl = editSection.querySelectorAll('input')[2];
    const release = editSection.querySelectorAll('input')[3];
    const label = editSection.querySelectorAll('input')[4];
    const sales = editSection.querySelectorAll('input')[5];

    singer.value = data.singer;
    album.value = data.album;
    imageUrl.value = data.imageUrl;
    release.value = data.release;
    label.value = data.label;
    sales.value = data.sales;

    Array.from(document.querySelectorAll('section')).forEach(s => s.remove());
    main.appendChild(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/albums/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.singer === '' || object.album === ''
        || object.imageUrl === '' || object.release === ''
        || object.label === '' || object.sales === '') {
        return;
    }
    const data = await requester('put', url, object);

    details(id, data._ownerId);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const isConfirm = confirm('Are you sure?');
    if (isConfirm) {
        const url = `data/albums/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }

}

showNavbar();
showHome();