import { render, html } from '../../../node_modules/lit-html/lit-html.js';
import { classMap } from '../../../node_modules/lit-html/directives/class-map.js';

document.querySelector('#searchBtn').addEventListener('click', onClick);

let templates;
renderDataFunc();
let searchString;

async function renderDataFunc() {
   const url = 'http://localhost:3030/jsonstore/advanced/table';
   const response = await fetch(url);
   const data = await response.json();

   const tableBody = document.querySelector('table tbody');

   const renderData = (e) => {
      const classes = {
         select:
            searchString && (e.firstName.toLowerCase().includes(searchString.toLowerCase())
            || e.lastName.toLowerCase().includes(searchString.toLowerCase())
            || e.email.toLowerCase().includes(searchString.toLowerCase())
            || e.course.toLowerCase().includes(searchString.toLowerCase()))
      };
      return html`
         <tr class=${classMap(classes)}>
            <td>${e.firstName + ' ' + e.lastName}</td>
            <td>${e.email}</td>
            <td>${e.course}</td>
         </tr>`;
   }
   templates = Object.values(data).map(e => renderData(e));
   render(templates, tableBody);

   return data;
}

function onClick() {
   const search = document.getElementById('searchField');
   searchString = search.value;
   renderDataFunc();
}