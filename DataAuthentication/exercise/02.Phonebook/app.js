function attachEvents() {
    document.getElementById('btnLoad').addEventListener('click', onLoadAllRecords);
    document.getElementById('btnCreate').addEventListener('click', handleCreateRecord);
}

function handleCreateRecord() {
    const personEl = document.getElementById('person');
    const phoneEl = document.getElementById('phone');

    onCreateRecord(personEl.value, phoneEl.value);
    personEl.value = '';
    phoneEl.value = '';
}

function renderRecord(data) {
    const ul = document.getElementById('phonebook');
    ul.innerHTML = '';
    Object.values(data).forEach(rec => {
        const li = document.createElement('li');
        li.textContent = `${rec.person}: ${rec.phone}`;
        li.setAttribute('data-id', rec._id);
        
        const button = document.createElement('button');
        button.textContent = 'Delete';
        button.addEventListener('click', handleDelete);
        li.appendChild(button);
        ul.appendChild(li);
    })
}

async function handleDelete(e) {
    const li = e.target.parentElement;
    const id = li.getAttribute('data-id');

    onDelete(id);
    li.remove();
}

async function onLoadAllRecords() {
    const url = 'http://localhost:3030/jsonstore/phonebook';
    const response = await fetch(url);
    const data = await response.json();

    return renderRecord(data);
}

async function onCreateRecord(person, phone) {
    const url = 'http://localhost:3030/jsonstore/phonebook';
    const body = {
        person,
        phone
    }
    const header = getHeader('post', body);
    const response = await fetch(url, header);
    const data = await response.json();
    onLoadAllRecords();
    return data;
}

async function onDelete(id) {
    const url = `http://localhost:3030/jsonstore/phonebook/${id}`;
    
    const header = getHeader('delete', null);
    const response = await fetch(url, header);
    const data = await response.json();
    return data;
}

function getHeader(method, body) {
    return {
        method: `${method}`,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }
}

attachEvents();