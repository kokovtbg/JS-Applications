import {render, html} from 'https://unpkg.com/lit-html?module';
import {repeat} from 'https://unpkg.com/lit-html/directives/repeat.js?module';


const townsInput = document.getElementById('towns');
const button = document.getElementById('btnLoadTowns');
button.addEventListener('click', showTowns);
let rootDiv = document.getElementById('root');
function showTowns(e) {
    e.preventDefault();
    
    const towns = townsInput.value.split(', ');
    const templateFunc = () => html`<ul>${repeat(towns, i => 
        html`<li>${i}</li>`)}
    </ul>`;
    const template = templateFunc();
    render(template, rootDiv);
}
