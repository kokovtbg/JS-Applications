import { html, render } from "../../../../../node_modules/lit-html/lit-html.js";
import { requester } from "./api.js";


let main = document.querySelector('main');
const logo = document.getElementById('logo');
logo.addEventListener('click', showHome);
const homeSection = document.getElementById('home');
const dashboardButton = document.querySelector('nav div a');
dashboardButton.addEventListener('click', showDashboard);
const headerNoItems = document.querySelectorAll('#dashboard h2')[1];
const createSection = document.getElementById('create');

const loginSection = document.getElementById('login');
const registerSection = document.getElementById('register');
const dashboard = document.getElementById('dashboard');
const detailsSection = document.getElementById('details');
const detailsWrapper = document.getElementById('details-wrapper');
const editSection = document.getElementById('edit');

detailsWrapper.innerHTML = '';

dashboard.querySelectorAll('.offer').forEach(o => o.remove());

document.querySelectorAll('section').forEach(s => s.remove());
main.appendChild(homeSection);

const loginButtoon = document.querySelectorAll('nav div.guest a')[0];
const registerButton = document.querySelectorAll('nav div.guest a')[1];
loginButtoon.addEventListener('click', login);
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('nav div.user a')[1];
logoutButton.addEventListener('click', logout);
const createButton = document.querySelector('nav div.user a');
createButton.addEventListener('click', create);

function showHome(e) {
    e.preventDefault();
    main.replaceChildren(homeSection);
}

function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        document.querySelector('div.guest').style.display = 'none';
        document.querySelector('div.user').style.display = 'inline';
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
        || object['re-password'] !== object.password) {
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

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/offers?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    const offers = data.map(e => html`
    <div class="offer">
        <img src=${e.imageUrl.substring(1)} alt="example1" />
        <p>
            <strong>Title: </strong><span class="title">${e.title}</span>
        </p>
        <p><strong>Salary:</strong><span class="salary">${e.salary}</span></p>
        <a class="details-btn" href="" id=${e._id} data-id=${e._ownerId} @click=${details}>Details</a>
    </div>`);



    render(offers, dashboard);
    if (data.length > 0) {
        headerNoItems.remove();
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
    const url = 'data/offers';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.imageUrl === ''
        || object.category === '' || object.description === ''
        || object.requirements === '' || object.salary === '') {
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

    const url = `data/offers/${id}`;
    const data = await requester('get', url);
    
    const urlCountApps = `data/applications?where=offerId%3D%22${id}%22&distinct=_ownerId&count`;
    const dataCountApps = await requester('get', urlCountApps);
    
    const urlCountAppsUser = `data/applications?where=offerId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const dataCountAppsUser = await requester('get', urlCountAppsUser);
    
    const template = () => html`
    <img id="details-img" src=${data.imageUrl.substring(1)} alt="example1" />
    <p id="details-title">${data.title}</p>
    <p id="details-category">
        Category: <span id="categories">${data.category}</span>
    </p>
    <p id="details-salary">
        Salary: <span id="salary-number">${data.salary}</span>
    </p>
    <div id="info-wrapper">
        <div id="details-description">
            <h4>Description</h4>
            <span>${data.description}</span>
        </div>
        <div id="details-requirements">
            <h4>Requirements</h4>
            <span>${data.requirements}</span>
        </div>
    </div>
    <p>Applications: <strong id="applications">${dataCountApps}</strong></p>
    
    <!--Edit and Delete are only for creator-->
    ${idOwner === currId ? html`
    <div id="action-buttons">
        <a href="" id="edit-btn" @click=${edit} data-id=${data._id}>Edit</a>
        <a href="" id="delete-btn" @click=${deleteItem} data-id=${data._id}>Delete</a>
    
        <!--Bonus - Only for logged-in users ( not authors )-->
    
    </div>` : html``}
    ${currId && idOwner !== currId && dataCountAppsUser === 0 ? html`
    <div id="action-buttons">
        <a href="" id="apply-btn" @click=${apply} data-ownerId=${idOwner} data-id=${id}>Apply</a>
    </div>` : html``}`;



    render(template(), detailsWrapper);
    main.replaceChildren(detailsSection);

    return data;
}

async function apply(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const object = {offerId: id};
    const url = 'data/applications';
    const data = await requester('post', url, object);
    
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/offers/${id}`;
    const data = await requester('get', url);
    
    const title = editSection.querySelectorAll('input')[0];
    const imageUrl = editSection.querySelectorAll('input')[1];
    const category = editSection.querySelectorAll('input')[2];
    const salary = editSection.querySelectorAll('input')[3];
    const description = editSection.querySelectorAll('textarea')[0];
    const requirements = editSection.querySelectorAll('textarea')[1];

    title.value = data.title;
    imageUrl.value = data.imageUrl;
    category.value = data.category;
    salary.value = data.salary;
    description.value = data.description;
    requirements.value = data.requirements;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/offers/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.imageUrl === ''
        || object.category === '' || object.description === '' 
        || object.requirements === '' || object.salary === '') {
        return;
    }
    const data = await requester('put', url, object);
    
    details(id, data._ownerId);
    main.replaceChildren(editSection);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const url = `data/offers/${id}`;
    const data = await requester('delete', url);
    
    showDashboard();
    main.replaceChildren(dashboard);
    return data;
}

showNavbar();