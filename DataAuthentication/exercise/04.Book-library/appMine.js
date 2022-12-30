const buttonLoad = document.getElementById('loadBooks');
buttonLoad.addEventListener('click', loadBooks);

let buttonForm = document.querySelector('form button');
buttonForm.addEventListener('click', createBook);

let headerForm = document.querySelector('form h3');
const tableBody = document.querySelector('table tbody');
tableBody.innerHTML = '';
let id = 0;

async function loadBooks() {
    tableBody.innerHTML = '';
    
    const url = 'http://localhost:3030/jsonstore/collections/books';
    const response = await fetch(url);
    const data = await response.json();

    Object.entries(data).forEach(([k, v]) => {
        const row = document.createElement('tr');
        
        const authorTD = document.createElement('td');
        authorTD.textContent = v.author;
        const titleTD = document.createElement('td');
        titleTD.textContent = v.title;
        
        const buttonsTD = document.createElement('td');
        const buttonEdit = document.createElement('button');
        buttonEdit.textContent = 'Edit';
        buttonEdit.addEventListener('click', editBook);
        const buttonDelete = document.createElement('button');
        buttonDelete.textContent = 'Delete';
        buttonDelete.addEventListener('click', deleteBook);
        const span = document.createElement('span');
        span.textContent = k;
        span.style.display = 'none';
        
        buttonsTD.appendChild(buttonEdit);
        buttonsTD.appendChild(buttonDelete);
        row.appendChild(titleTD);
        row.appendChild(authorTD);
        row.appendChild(buttonsTD);
        row.appendChild(span);
        tableBody.appendChild(row);
    })
}

async function createBook(e) {
    e.preventDefault();
    const inputs = e.target.parentElement.querySelectorAll('input');
    if (inputs[0].value === '' || inputs[1].value === '') {
        return;
    }
    const formEl = e.target.parentElement;
    let formData = new FormData(formEl);
    
    formData = Object.fromEntries(formData.entries());
    
    const url = id === 0 ? 
    'http://localhost:3030/jsonstore/collections/books' : 
    `http://localhost:3030/jsonstore/collections/books/${id}`;
    const response = await fetch(url, {
        method: id === 0 ? 'post' : 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
    loadBooks();

    inputs.forEach(e => e.value = '');
    id = 0;
    headerForm.textContent = 'FORM';
    buttonForm.textContent = 'Submit';

    return await response.json();
}

async function editBook(e) {
    headerForm.textContent = 'Edit FORM';
    buttonForm.textContent = 'Save';
    const spanID = e.target.parentElement.parentElement.querySelector('span');
    id = spanID.textContent;

    const url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const title = document.querySelector("input[name='title']");
    const author = document.querySelector("input[name='author']");
    title.value = data.title;
    author.value = data.author;
}

async function deleteBook(e) {
    const spanID = e.target.parentElement.parentElement.querySelector('span');
    id = spanID.textContent;
    const url = `http://localhost:3030/jsonstore/collections/books/${id}`;

    const response = await fetch(url, {
        method: 'delete'
    });
    loadBooks();
    id = 0;

    return response.json();
}