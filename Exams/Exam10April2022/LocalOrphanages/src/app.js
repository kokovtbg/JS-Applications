import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.getElementById('main-content');
const logo = document.querySelector('header h1 a');
logo.addEventListener('click', showDashboard);
const dashboard = document.getElementById('dashboard-page');
const loginSection = document.getElementById('login-page');
const registerSection = document.getElementById('register-page');
const headerNoItems = document.querySelectorAll('section#dashboard-page h1')[1];
const dashboardDivAllPosts = document.querySelector('section#dashboard-page div.all-posts');
dashboardDivAllPosts.innerHTML = '';
const createSection = document.getElementById('create-page');
const detailsSection = document.getElementById('details-page');
const detailsDiv = document.querySelector('section#details-page div#details');
detailsDiv.innerHTML = '';
const editSection = document.getElementById('edit-page');
const myPostSection = document.getElementById('my-posts-page');
const myPostDiv = myPostSection.querySelector('.my-posts');
myPostDiv.innerHTML = '';

document.querySelectorAll('section').forEach(s => s.remove());
main.appendChild(dashboard);

const loginButton = document.querySelectorAll('div#guest a')[0];
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('div#guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('div#user a')[2];
logoutButton.addEventListener('click', logout);
const dashboardButton = document.querySelector('nav a');
dashboardButton.addEventListener('click', showDashboard);
const createButton = document.querySelectorAll('div#user a')[1];
createButton.addEventListener('click', create);
const myPostsButton = document.querySelector('div#user a');
myPostsButton.addEventListener('click', showMyPosts);

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/posts?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    const posts = data.map(p => html`
    <div class="post">
        <h2 class="post-title">${p.title}</h2>
        <img class="post-image" src=".${p.imageUrl}" alt="Material Image">
        <div class="btn-wrapper">
            <a href="#" class="details-btn btn" @click=${details} id=${p._id} data-id=${p._ownerId}>Details</a>
        </div>
    </div>`);



    render(posts, dashboardDivAllPosts);
    if (data.length > 0) {
        headerNoItems.remove();
    }

    main.replaceChildren(dashboard);
}

function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        document.querySelector('div#guest').style.display = 'none';
        document.querySelector('div#user').style.display = 'inline';
    } else {
        document.querySelector('div#user').style.display = 'none';
        document.querySelector('div#guest').style.display = 'inline';
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
    showDashboard();
    form.reset();
    main.replaceChildren(dashboard);
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
    showDashboard();
    form.reset();
    main.replaceChildren(dashboard);
    showNavbar();

    return data;
}

async function logout(e) {
    e.preventDefault();
    const response = await requester('get', 'users/logout');

    sessionStorage.clear();
    showNavbar();
    showDashboard();
    main.replaceChildren(dashboard);
    return response;
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/posts';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '' || object.address === ''
        || object.phone === '') {
        return;
    }
    const data = await requester('post', url, object);

    showDashboard();
    main.replaceChildren(dashboard);
    form.reset();
    return data;
}

async function details(e, ownerId) {
    e.target ? e.preventDefault() : '';
    const id = e.target ? e.target.id : e;
    const idOwner = e.target ? e.target.getAttribute('data-id') : ownerId;
    const currId = sessionStorage.getItem('id');

    const url = `data/posts/${id}`;
    const data = await requester('get', url);
    
    const urlCountDonations = `data/donations?where=postId%3D%22${id}%22&distinct=_ownerId&count`;
    const dataCountDonations = await requester('get', urlCountDonations);
    
    const urlCountDonationsUser = `data/donations?where=postId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const dataCountDonationsUser = await requester('get', urlCountDonationsUser);
    
    const template = () => html`
    <div class="image-wrapper">
        <img src=".${data.imageUrl}" alt="Material Image" class="post-image">
    </div>
    <div class="info">
        <h2 class="title post-title">${data.title}</h2>
        <p class="post-description">Description: ${data.description}</p>
        <p class="post-address">Address: ${data.address}</p>
        <p class="post-number">Phone number: ${data.phone}</p>
        <p class="donate-Item">Donate Materials: ${dataCountDonations}</p>
    
        <!--Edit and Delete are only for creator-->
        ${idOwner === currId ? html`
        <div class="btns">
            <a href="#" class="edit-btn btn" @click=${edit} data-id=${data._id}>Edit</a>
            <a href="#" class="delete-btn btn" @click=${deleteItem} data-id=${data._id}>Delete</a>
    
            <!--Bonus - Only for logged-in users ( not authors )-->
            <!-- <a href="#" class="donate-btn btn">Donate</a> -->
        </div>` : html``}
        ${currId && idOwner !== currId && dataCountDonationsUser === 0 ? html`
        <div class="btns">
            <!--Bonus - Only for logged-in users ( not authors )-->
            <a href="#" class="donate-btn btn" @click=${donate} data-id=${id} data-ownerId=${idOwner}>Donate</a>
        </div>` : html``}
    
    </div>`;



    render(template(), detailsDiv);
    main.replaceChildren(detailsSection);

    return data;
}

async function donate(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const object = {postId: id};
    const url = 'data/donations';
    const data = await requester('post', url, object);
    
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/posts/${id}`;
    const data = await requester('get', url);
    
    const title = editSection.querySelectorAll('input')[0];
    const description = editSection.querySelectorAll('input')[1];
    const imageUrl = editSection.querySelectorAll('input')[2];
    const address = editSection.querySelectorAll('input')[3];
    const phone = editSection.querySelectorAll('input')[4];

    title.value = data.title;
    description.value = data.description;
    imageUrl.value = data.imageUrl;
    address.value = data.address;
    phone.value = data.phone;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/posts/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '' || object.address === ''
        || object.phone === '') {
        return;
    }
    const data = await requester('put', url, object);

    edit(id);
    main.replaceChildren(editSection);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const isConfirm = confirm("Press a button!");
    if (isConfirm) {
        const id = e.target.getAttribute('data-id');
        const url = `data/posts/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        main.replaceChildren(dashboard);
        return data;
    }
}

async function showMyPosts(e) {
    e.preventDefault();
    const userId = sessionStorage.getItem('id');
    const url = `data/posts?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`;
    const data = await requester('get', url);
    const template = data.map(e => html`
    <div class="post">
        <h2 class="post-title">${e.title}</h2>
        <img class="post-image" src=".${e.imageUrl}" alt="Material Image">
        <div class="btn-wrapper">
            <a href="#" class="details-btn btn" @click=${details} id=${e._id} data-id=${e._ownerId}>Details</a>
        </div>
    </div>`)
    render(template, myPostDiv);
    main.replaceChildren(myPostSection);

    return data;
}

showDashboard();
showNavbar();