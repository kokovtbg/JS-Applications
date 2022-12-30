import { html, render } from "../../../node_modules/lit-html/lit-html.js";
import {repeat} from "../../../node_modules/lit-html/directives/repeat.js";
import { cats } from "./catSeeder.js";

let catsSection = document.getElementById('allCats');
const renderCats = () => html`
    <ul>${repeat(cats, i => i.id, cat => html`
        <li>
            <img src="./images/${cat.imageLocation}.jpg" width="250" height="250" alt="Card image cap">
            <div class="info">
                <button @click=${showMore.bind(null, cat)} class="showBtn">Show status code</button>
                <div class="status" style="display: none" id=${cat.id}>
                    <h4>Status Code: ${cat.statusCode}</h4>
                    <p>${cat.statusMessage}</p>
                </div>
            </div>
        </li>`)}
    
    </ul>`;
render(renderCats(), catsSection);


function showMore(cat) {
    const divMore = document.getElementById(`${cat.id}`);
    const button = divMore.parentElement.querySelector('button');
    divMore.style.display = divMore.style.display === 'none' 
    ? 'block' : 'none';
    button.textContent = button.textContent === 'Show status code'
    ? 'Hide status code' : 'Show status code';
}