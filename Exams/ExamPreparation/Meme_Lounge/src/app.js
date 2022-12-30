import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.querySelector('main');
const homeSection = document.getElementById('welcome');
const loginSection = document.getElementById('login');
const registerSection = document.getElementById('register');
const dashboard = document.getElementById('meme-feed');
const memesDiv = document.getElementById('memes');
const paragraphNoItems = memesDiv.querySelectorAll('p')[5];
memesDiv.innerHTML = '';
const createSection = document.getElementById('create-meme');
const detailsSection = document.getElementById('meme-details');
detailsSection.innerHTML = '';
const editSection = document.getElementById('edit-meme');
const myMemesSection = document.getElementById('user-profile-page');
const paragraphNoMemes = myMemesSection.querySelectorAll('.user-meme-listings p')[2];
const divListMemes = myMemesSection.querySelector('.user-meme-listings');
divListMemes.innerHTML = '';
myMemesSection.innerHTML = '';
const loginButtonWelcome = document.querySelectorAll('#button-div a')[0];
loginButtonWelcome.addEventListener('click', login);
const registerButtonWelcome = document.querySelectorAll('#button-div a')[1];
registerButtonWelcome.addEventListener('click', register);
const notifySection = document.getElementById('notifications');
const container = document.getElementById('container');
const signUp = loginSection.querySelector('p a');
signUp.addEventListener('click', register);
const signIn = registerSection.querySelector('p a');
signIn.addEventListener('click', login);

document.querySelectorAll('section').forEach(s => s.remove());


const loginButton = document.querySelector('div.guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('div.guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('div.user a')[2];
logoutButton.addEventListener('click', logout);
const memesButton = document.querySelector('nav a');
memesButton.addEventListener('click', showDashboard);
const createButton = document.querySelector('div.user a');
createButton.addEventListener('click', create);
const myProfileButton = document.querySelectorAll('div.user a')[1];
myProfileButton.addEventListener('click', showMyMemes);
const homeButton = document.querySelectorAll('div.guest a')[2];
homeButton.addEventListener('click', showHome);

function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    const email = sessionStorage.getItem('email');
    if (token) {
        document.querySelector('div.user').style.display = 'inline';
        document.querySelector('div.guest').style.display = 'none';
        document.querySelector('div.user span').textContent = `Welcome, ${email}`;
    } else {
        document.querySelector('div.user').style.display = 'none';
        document.querySelector('div.guest').style.display = 'inline';
    }

}

function login(e) {
    e.preventDefault();
    main.replaceChildren(loginSection);
    loginSection.addEventListener('submit', onLogin);
}

async function onLogin(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === '') {
        // window.alert('No user');
        notify();
        return;
    }

    const data = await requester('post', 'users/login', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('gender', data.gender);

    form.reset();
    showDashboard();
    showNavbar();

    return data;
}

function register(e) {
    e.preventDefault();
    main.replaceChildren(registerSection);
    registerSection.addEventListener('submit', onRegister);
}

async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === ''
        || object['repeatPass'] !== object.password) {
        // window.alert('No user');
        notify();
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('gender', data.gender);

    form.reset();
    showDashboard();
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

function showHome() {
    main.replaceChildren(homeSection);
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/memes?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    const memes = data.map(m => html`
    <div class="meme">
        <div class="card">
            <div class="info">
                <p class="meme-title">${m.title}</p>
                <img class="meme-image" alt="meme-img" src=".${m.imageUrl}">
            </div>
            <div id="data-buttons">
                <a class="button" href="#" @click=${details} id=${m._id} data-id=${m._ownerId}>Details</a>
            </div>
        </div>
    </div>`);


    render(memes, memesDiv);
    if (data.length === 0) {
        memesDiv.appendChild(paragraphNoItems);
    }

    main.replaceChildren(dashboard);
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/memes';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '') {
        notify();
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

    const url = `data/memes/${id}`;
    const data = await requester('get', url);
    
    const template = () => html`
    <h1>Meme Title: ${data.title}
    
    </h1>
    <div class="meme-details">
        <div class="meme-img">
            <img alt="meme-alt" src=".${data.imageUrl}">
        </div>
        <div class="meme-description">
            <h2>Meme Description</h2>
            <p>
                ${data.description}
            </p>
    
            <!-- Buttons Edit/Delete should be displayed only for creator of this meme  -->
            ${idOwner === currId ? html`
            <a class="button warning" href="#" @click=${edit} data-id=${data._id}>Edit</a>
            <button class="button danger" @click=${deleteItem} data-id=${data._id}>Delete</button>` : html``}
    
        </div>
    </div>`;


    render(template(), detailsSection);
    main.replaceChildren(detailsSection);

    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/memes/${id}`;
    const data = await requester('get', url);
    
    const title = editSection.querySelectorAll('input')[0];
    const image = editSection.querySelectorAll('input')[1];
    const description = editSection.querySelector('textarea');

    title.value = data.title;
    image.value = data.imageUrl;
    description.value = data.description;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/memes/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '') {
        notify();
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
        const url = `data/memes/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }
}

async function showMyMemes(e) {
    e.preventDefault();

    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const gender = sessionStorage.getItem('gender');

    const userId = sessionStorage.getItem('id');
    const url = `data/memes?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`;
    const data = await requester('get', url);
    
    const templateUser = html`
    <article class="user-info">
        <img id="user-avatar-url" alt="user-profile" src="./images/${gender}.png">
        <div class="user-content">
            <p>Username: ${username}</p>
            <p>Email: ${email}</p>
            <p>My memes count: ${data.length}</p>
        </div>
    </article>
    <h1 id="user-listings-title">User Memes</h1>`

    const templateList = data.map(m => html`
    <div class="user-meme">
        <p class="user-meme-title">${m.title}</p>
        <img class="userProfileImage" alt="meme-img" src=".${m.imageUrl}">
        <a class="button" href="#" @click=${details} id=${m._id} data-id=${m._ownerId}>Details</a>
    </div>`);

    render(templateUser, myMemesSection);
    render(templateList, divListMemes);
    myMemesSection.appendChild(divListMemes);

    if (data.length === 0) {
        divListMemes.appendChild(paragraphNoMemes);
    }

    main.replaceChildren(myMemesSection);
}

function notify() {
    container.appendChild(notifySection);
    notifySection.querySelector('.notification').style.display = 'block';
    setTimeout(() => notifySection.remove(), 3000);
}

showHome();
showNavbar();