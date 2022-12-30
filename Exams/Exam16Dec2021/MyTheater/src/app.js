import { html, render } from "../../../../../node_modules/lit-html/lit-html.js";
import { requester } from './api.js';

let main = document.getElementById('content');
const loginSection = document.getElementById('loginaPage');
const registerSection = document.getElementById('registerPage');
const dashboard = document.querySelector('.welcomePage');
dashboard.innerHTML = '';
const createSection = document.getElementById('createPage');
const detailsSection = document.getElementById('detailsPage');
detailsSection.innerHTML = '';
const editSection = document.getElementById('editPage');
const profileSection = document.getElementById('profilePage');
profileSection.innerHTML = '';


document.querySelectorAll('section').forEach(s => s.remove());


const loginButton = document.querySelectorAll('nav ul li a')[3];
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('nav ul li a')[4];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('nav ul li a')[2];
logoutButton.addEventListener('click', logout);
const createButton = document.querySelectorAll('nav ul li a')[1];
createButton.addEventListener('click', create);
const dashboardButton = document.querySelector('nav a');
dashboardButton.addEventListener('click', showDashboard);
const profileButton = document.querySelectorAll('nav ul li a')[0];
profileButton.addEventListener('click', showProfile);


function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        profileButton.style.display = 'inline';
        createButton.style.display = 'inline';
        logoutButton.style.display = 'inline';
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
    } else {
        profileButton.style.display = 'none';
        createButton.style.display = 'none';
        logoutButton.style.display = 'none';
        loginButton.style.display = 'inline';
        registerButton.style.display = 'inline';
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
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/login', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

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
        || object['repeatPassword'] !== object.password) {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

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
    showDashboard();
    return response;
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/theaters?sortBy=_createdOn%20desc&distinct=title';
    const data = await requester('get', url);
    
    const template = html`
    <div id="welcomeMessage">
        <h1>My Theater</h1>
        <p>Since 1962 World Theatre Day has been celebrated by ITI Centres, ITI Cooperating Members, theatre
            professionals, theatre organizations, theatre universities and theatre lovers all over the world on
            the 27th of March. This day is a celebration for those who can see the value and importance of the
            art
            form “theatre”, and acts as a wake-up-call for governments, politicians and institutions which have
            not
            yet recognised its value to the people and to the individual and have not yet realised its potential
            for
            economic growth.</p>
    </div>
    <div id="events">
        <h1>Future Events</h1>
        <div class="theaters-container">
    
            <!--Created Events-->
            ${data.map(e => html`
            <div class="eventsInfo">
                <div class="home-image">
                    <img src=".${e.imageUrl}">
                </div>
                <div class="info">
                    <h4 class="title">${e.title}</h4>
                    <h6 class="date">${e.date}</h6>
                    <h6 class="author">${e.author}</h6>
                    <div class="info-buttons">
                        <a class="btn-details" href="#" @click=${details} id=${e._id} data-id=${e._ownerId}>Details</a>
                    </div>
                </div>
            </div>`)}
    
            <!--No Theaters-->
            ${data.length === 0 ? html`<h4 class="no-event">No Events Yet...</h4>` : html``}
        </div>
    </div>`

    render(template, dashboard);
    main.replaceChildren(dashboard);
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/theaters';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.date === ''
        || object.author === '' || object.description === ''
        || object.imageUrl === '') {
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

    const url = `data/theaters/${id}`;
    const data = await requester('get', url);
    
    const urlLikes = `data/likes?where=theaterId%3D%22${id}%22&distinct=_ownerId&count`; 
    const dataLikes = await requester('get', urlLikes);
    
    const urlLikesUser = `data/likes?where=theaterId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const dataLikesUser = await requester('get', urlLikesUser);
    
    const template = () => html`
    <div id="detailsBox">
        <div class="detailsInfo">
            <h1>Title: ${data.title}</h1>
            <div>
                <img src=".${data.imageUrl}" />
            </div>
        </div>
    
        <div class="details">
            <h3>Theater Description</h3>
            <p>${data.description}</p>
            <h4>Date: ${data.date}</h4>
            <h4>Author: ${data.author}</h4>
            <div class="buttons">
                ${idOwner === currId ? html`
                <a class="btn-delete" href="#" @click=${deleteItem} data-id=${data._id}>Delete</a>
                <a class="btn-edit" href="#" @click=${edit} data-id=${data._id}>Edit</a>` : html``}
                ${currId && idOwner !== currId && dataLikesUser === 0 ? html`
                <a class="btn-like" href="#" @click=${like} data-id=${data._id} data-ownerId=${data._ownerId}>Like</a>` : html``}
            </div>
            <p class="likes">Likes: ${dataLikes}</p>
        </div>
    </div>`;


    render(template(), detailsSection);
    main.replaceChildren(detailsSection);

    return data;
}

async function like(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const object = {
        theaterId: id
    }
    const url = 'data/likes';
    const data = await requester('post', url, object);
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    const url = `data/theaters/${id}`;
    const data = await requester('get', url);
    
    const title = editSection.querySelectorAll('input')[0];
    const date = editSection.querySelectorAll('input')[1];
    const author = editSection.querySelectorAll('input')[2];
    const description = editSection.querySelector('textarea');
    const imageUrl = editSection.querySelectorAll('input')[3];

    title.value = data.title;
    date.value = data.date;
    author.value = data.author;
    description.value = data.description;
    imageUrl.value = data.imageUrl;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/theaters/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.date === ''
        || object.author === '' || object.description === ''
        || object.imageUrl === '') {
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
        const url = `data/theaters/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }
}

async function showProfile(e) {
    e.preventDefault();
    const userId = sessionStorage.getItem('id');
    const email = sessionStorage.getItem('email');
    
    const url = `data/theaters?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`;
    const data = await requester('get', url);
    
    const template = html`
    <div class="userInfo">
        <div class="avatar">
            <img src="./images/profilePic.png">
        </div>
        <h2>${email}</h2>
    </div>
    <div class="board">
        <!--If there are event-->
        ${data.map(e => html`
        <div class="eventBoard">
            <div class="event-info">
                <img src=".${e.imageUrl}">
                <h2>${e.title}</h2>
                <h6>${e.date}</h6>
                <a href="#" class="details-button" @click=${details} id=${e._id} data-id=${e._ownerId}>Details</a>
            </div>
        </div>`)}
    
        <!--If there are no event-->
        ${data.length === 0 ? html`<div class="no-events">
            <p>This user has no events yet!</p>
        </div>` : html``}
    </div>`;

    render(template, profileSection);
    main.replaceChildren(profileSection);
}

showDashboard();
showNavbar();