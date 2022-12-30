import { render, html } from '../../../node_modules/lit-html/lit-html.js';

const body = document.querySelector('body');
const initState = html`
<button @click=${loadBooks.bind(null)} id="loadBooks">LOAD ALL BOOKS</button>
<table>
    <thead>
        <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>

    </tbody>
</table>`
const renderInit = () => html`
${initState}
<form id="add-form" @submit=${addBook.bind(null)}>
    <h3>Add book</h3>
    <label>TITLE</label>
    <input type="text" name="title" placeholder="Title...">
    <label>AUTHOR</label>
    <input type="text" name="author" placeholder="Author...">
    <input type="submit" value="Submit">
</form>`;
render(renderInit(), body);

async function loadBooks() {
    const url = 'http://localhost:3030/jsonstore/collections/books';
    const response = await fetch(url);
    const data = await response.json();

    const template = ([id, book]) => html`
    <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>
            <button @click=${editBook.bind(null, id)}>Edit</button>
            <button @click=${deleteBook.bind(null, id)}>Delete</button>
        </td>
    </tr>`;

    const books = Object.entries(data).map(([id, b]) => template([id, b]));
    const tableBody = document.querySelector('tbody');
    render(books, tableBody);

    return data;
}

async function addBook(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData);
    if (body.title === '' || body.author === '') {
        return;
    }
    const url = 'http://localhost:3030/jsonstore/collections/books';
    const response = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    loadBooks();
    form.reset();
    const data = await response.json();
    return data;
}

async function editBook(id) {
    const url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    const template = () => html`
    ${initState}
    <form id="edit-form" @submit=${onEdit.bind(null)}>
        <input type="hidden" name=${data._id}>
        <h3>Edit book</h3>
        <label>TITLE</label>
        <input type="text" name="title" placeholder="Title..." value=${data.title}>
        <label>AUTHOR</label>
        <input type="text" name="author" placeholder="Author..." value=${data.author}>
        <input type="submit" value="Save">
    </form>`
    render(template(), body);
    loadBooks();
    
    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const form = e.target;
    const inputId = form.querySelector('input');
    const id = inputId.name;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData);
    if (body.title === '' || body.author === '') {
        return;
    }
    const url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    const response = await fetch(url, {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    form.reset();
    loadBooks();
    const data = await response.json();
    return data;
}

async function deleteBook(id) {
    const url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    const response = await fetch(url, {
        method: 'delete'
    })
    const data = await response.json();
    loadBooks();
    return data;
}