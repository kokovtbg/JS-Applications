import {render} from '../../../../node_modules/lit-html/lit-html.js'
import page from '../../../../node_modules/page/page.mjs';
import { catalogView } from './views/catalog.js';
import { createView } from './views/create.js';
import { detailsView } from './views/details.js';
import { editView } from './views/edit.js';
import { loginView } from './views/login.js';
import { myFurnitureView } from './views/my-furniture.js';
import { registerView } from './views/register.js';
import {logout} from './api/data.js'


const root = document.querySelector('.container');

page('/', renderMiddleWare, catalogView);
page('/catalog', renderMiddleWare, catalogView);
page('/create', renderMiddleWare, createView);
page('/details/:id', renderMiddleWare, detailsView);
page('/edit/:id', renderMiddleWare, editView);
page('/login', renderMiddleWare, loginView);
page('/register', renderMiddleWare, registerView);
page('/my-furniture', renderMiddleWare, myFurnitureView);
page('*', catalogView);
page.start();

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logout();
    updateNav();
    page.redirect('/');
})
updateNav();
function updateNav() {
    const userSection = document.getElementById('user');
    const guestSection = document.getElementById('guest');
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData) {
        userSection.style.display = 'inline-block';
        guestSection.style.display = 'none';
    } else {
        userSection.style.display = 'none';
        guestSection.style.display = 'inline-block';
    }
}

function renderMiddleWare(ctx, next) {
    ctx.render = (content) => render(content, root);
    ctx.updateNav = updateNav;
    next();
}