import { render, html } from 'https://unpkg.com/lit-html?module';

async function addItem() {
    const menuSelect = document.getElementById('menu');
    const url = 'http://localhost:3030/jsonstore/advanced/dropdown';
    const response = await fetch(url);
    const data = await response.json();

    const townsRender = (town) => html`
    <option value=${town._id}>${town.text}</option>`;
    
    const dataMap = Object.values(data)
        .map(e => townsRender(e));

    render(dataMap, menuSelect);

    const form = document.querySelector('form');
    form.addEventListener('submit', updateTowns);

    return data;
}

async function updateTowns(e) {
    e.preventDefault();
    const input = document.getElementById('itemText');
    if (input.value === '') {
        return;
    }
    const url = 'http://localhost:3030/jsonstore/advanced/dropdown';
    const body = {text: input.value}
    const response = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })

    addItem();
    input.value = '';
    const data = await response.json(body);

    return data;
}

addItem();