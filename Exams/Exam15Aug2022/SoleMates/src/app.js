import { html, render } from "../../../../../node_modules/lit-html/lit-html.js";
import { requester } from "./api.js";


const logo = document.getElementById('logo');
const home = document.getElementById('home');
const loginSection = document.getElementById('login');
const dashboard = document.getElementById('dashboard');
const registerSection = document.getElementById('register');
const createSection = document.getElementById('create');
const detailsSection = document.getElementById('details');
const detailsWrapper = document.getElementById('details-wrapper');
const detailsTitle = document.getElementById('details-title');
const headerNoItems = dashboard.querySelectorAll('h2')[1];
const editSection = document.getElementById('edit');
const searchSection = document.getElementById('search');


dashboard.querySelector('ul').innerHTML = '';
detailsWrapper.innerHTML = '';
detailsWrapper.appendChild(detailsTitle);

logo.addEventListener('click', showHome);
const dashboardButton = document.querySelector('nav div a');
dashboardButton.addEventListener('click', showDashboard);
const createButton = document.querySelector('div.user a');
createButton.addEventListener('click', create);
const searchButton = document.querySelectorAll('nav div a')[1];
searchButton.addEventListener('click', search);
const listSearch = document.querySelector('#search-container ul');
listSearch.innerHTML = '';
const searchContainer = document.getElementById('search-container');

document.querySelectorAll('section').forEach(s => s.remove());
let main = document.querySelector('main');
main.appendChild(home);

const loginButton = document.querySelector('div.guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('div.guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('div.user a')[1];
logoutButton.addEventListener('click', logout);

function showHome(e) {
    e.preventDefault();
    main.replaceChildren(home);
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

    const url = 'data/shoes?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    const shoes = data.map(e => html`
    <li class="card">
        <img src=".${e.imageUrl}" alt="travis" />
        <p>
            <strong>Brand: </strong><span class="brand">${e.brand}</span>
        </p>
        <p>
            <strong>Model: </strong><span class="model">${e.model}</span>
        </p>
        <p><strong>Value:</strong><span class="value">${e.value}</span>$</p>
        <a class="details-btn" href="" id=${e._id} data-id=${e._ownerId} @click=${details}>Details</a>
    </li>`);



    render(shoes, dashboard.querySelector('ul'));
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
    const url = 'data/shoes';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.brand === '' || object.model === ''
        || object.imageUrl === '' || object.release === ''
        || object.designer === '' || object.value === '') {
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

    const url = `data/shoes/${id}`;
    const data = await requester('get', url);
    
    const template = () => html`
    <div id="img-wrapper">
        <img src=".${data.imageUrl}" alt="example1" />
    </div>
    <div id="info-wrapper">
        <p>Brand: <span id="details-brand">${data.brand}</span></p>
        <p>
            Model: <span id="details-model">${data.model}</span>
        </p>
        <p>Release date: <span id="details-release">${data.release}</span></p>
        <p>Designer: <span id="details-designer">${data.designer}</span></p>
        <p>Value: <span id="details-value">${data.value}</span></p>
    </div>
    ${idOwner === currId ? html`<div id="action-buttons">
        <a href="" id="edit-btn" @click=${edit} data-id=${data._id}>Edit</a>
        <a href="" id="delete-btn" @click=${deleteItem} data-id=${data._id}>Delete</a>
    </div>` : html``}`;



    render(template(), detailsWrapper);
    main.replaceChildren(detailsSection);

    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/shoes/${id}`;
    const data = await requester('get', url);
    
    const brand = editSection.querySelectorAll('input')[0];
    const model = editSection.querySelectorAll('input')[1];
    const image = editSection.querySelectorAll('input')[2];
    const release = editSection.querySelectorAll('input')[3];
    const designer = editSection.querySelectorAll('input')[4];
    const value = editSection.querySelectorAll('input')[5];

    brand.value = data.brand;
    model.value = data.model;
    image.value = data.imageUrl;
    release.value = data.release;
    designer.value = data.designer;
    value.value = data.value;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/shoes/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.brand === '' || object.model === ''
        || object.imageUrl === '' || object.release === ''
        || object.designer === '' || object.value === '') {
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
    const url = `data/shoes/${id}`;
    const data = await requester('delete', url);
    
    showDashboard();
    main.replaceChildren(dashboard);
    return data;
}

function search(e) {
    e.preventDefault();
    main.replaceChildren(searchSection);
    searchSection.addEventListener('submit', onSearch);
}

async function onSearch(e) {
    e.preventDefault();
    
    const header = searchContainer.querySelector('h2');
    header ? searchContainer.removeChild(header) : '';
    
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const query = object.search;
    const token = sessionStorage.getItem('accessToken');
    const url = `data/shoes?where=brand%20LIKE%20%22${query}%22`;

    const data = await requester('get', url);
    const template = (item) => html`
    <li class="card">
        <img src=".${item.imageUrl}" alt="travis" />
        <p>
            <strong>Brand: </strong><span class="brand">${item.brand}</span>
        </p>
        <p>
            <strong>Model: </strong><span class="model">${item.model}</span>
        </p>
        <p><strong>Value:</strong><span class="value">${item.value}</span>$</p>
        <a class="details-btn" href="" style=${token !== null ? '' : 'display: none;'}>Details</a>
    </li>`
    const mappedData = data.map(e => template(e));
    render(mappedData, listSearch);
    if (data.length === 0) {
        const header = document.createElement('h2');
        header.textContent = 'There are no results found.';
        searchContainer.appendChild(header);
    }
    return data;
}

showNavbar();