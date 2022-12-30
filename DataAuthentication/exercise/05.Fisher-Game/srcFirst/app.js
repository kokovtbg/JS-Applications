window.addEventListener('DOMContentLoaded', onLoadHTML)

document.getElementById('logout').addEventListener('click', onLogout);
document.querySelector('.load').addEventListener('click', onLoadCatch);
const addButton = document.querySelector('.add');
addButton.addEventListener('click', createCatch);

let divCatches = document.getElementById('catches');

async function onLogout() {
    const url = 'http://localhost:3030/users/logout';
    const header = getHeader('get', null);
    const response = await fetch(url, header);
    sessionStorage.clear();
    onLoadHTML();
}

function onLoadHTML() {
    divCatches.innerHTML = '';
    const token = sessionStorage.getItem('userData');
    const userName = document.querySelector('p.email span');
    

    if (token) {
        document.getElementById('guest').style.display = 'none';
        document.getElementById('user').style.display = 'inline-block';
        const tokenParsed = JSON.parse(token);
        userName.innerHTML = tokenParsed.email;
        addButton.disabled = false;
    } else {
        document.getElementById('guest').style.display = 'inline-block';
        document.getElementById('user').style.display = 'none';
        userName.innerHTML = 'guest';
        addButton.disabled = true;
    }
}

function loadCatches(data) {
    divCatches.innerHTML = '';
    const userData = sessionStorage.getItem('userData');
    const parsedUserData = JSON.parse(userData);
    const userId = parsedUserData.id;
    data.forEach(e => {
        const div = document.createElement('div');
        div.classList.add('catch');
        div.innerHTML =
            `<label>Angler</label>
            <input type="text" class="angler" value="${e.angler}">
            <label>Weight</label>
            <input type="text" class="weight" value="${e.weight}">
            <label>Species</label>
            <input type="text" class="species" value="${e.species}">
            <label>Location</label>
            <input type="text" class="location" value="${e.location}">
            <label>Bait</label>
            <input type="text" class="bait" value="${e.bait}">
            <label>Capture Time</label>
            <input type="number" class="captureTime" value="${e.captureTime}">
            <button class="update" data-id="${e._id}">Update</button>
            <button class="delete" data-id="${e._id}">Delete</button>`;
        const updateBtn = div.querySelector('.update');
        const deleteBtn = div.querySelector('.delete');
        if (userData === null || userId !== e._ownerId) {
            updateBtn.disabled = true;
            deleteBtn.disabled = true;
            let inputs = Array.from(div.querySelectorAll('input'));
            inputs.forEach(i => i.disabled = true);
        }
        updateBtn.addEventListener('click', updateCatch);
        deleteBtn.addEventListener('click', deleteCatch);
        divCatches.appendChild(div);
    })
}

async function deleteCatch(e) {
    const id = e.target.getAttribute('data-id');
    const url = `http://localhost:3030/data/catches/${id}`;
    const header = getHeader('delete');
    const response = await fetch(url, header);
    const data = await response.json();
    return data;
}

function updateCatch(e) {
    const inputAngler = e.target.parentElement.querySelector('.angler');
    const inputWeight = e.target.parentElement.querySelector('.weight');
    const inputSpecies = e.target.parentElement.querySelector('.species');
    const inputLocation = e.target.parentElement.querySelector('.location');
    const inputBait = e.target.parentElement.querySelector('.bait');
    const inputCaptureTime = e.target.parentElement.querySelector('.captureTime');
    const catchObj = {
        angler: inputAngler.value,
        weight: inputWeight.value,
        species: inputSpecies.value,
        location: inputLocation.value,
        bait: inputBait.value,
        captureTime: inputCaptureTime.value
    };
    
    const id = e.target.getAttribute('data-id');
    onUpdateCatch(catchObj, id);
    
}

async function onUpdateCatch(catchObj, id) {
    const url = `http://localhost:3030/data/catches/${id}`;
    const header = getHeader('put', catchObj);
    const response = await fetch(url, header);
    const data = await response.json();
    return data;
}

async function onLoadCatch() {
    const url = 'http://localhost:3030/data/catches';
    const response = await fetch(url);
    const data = await response.json();
    loadCatches(data);
    return data;
}

function createCatch(e) {
    e.preventDefault();
    const form = e.target.parentElement.parentElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    document.querySelectorAll('#addForm input').forEach(e => e.value = '');
    onCreateCatch(data);
}

async function onCreateCatch(body) {
    const url = 'http://localhost:3030/data/catches';
    const header = getHeader('post', body);
    const response = await fetch(url, header);
    const data = await response.json();
    return data;
}

function getHeader(method, body) {
    const token = sessionStorage.getItem('userData');
    const tokenParsed = JSON.parse(token);
    const accessToken = tokenParsed.accessToken;
    let header = {
        method: `${method}`,
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken
        }
    }
    if (body) {
        header.body = JSON.stringify(body);
    }
    return header;
}