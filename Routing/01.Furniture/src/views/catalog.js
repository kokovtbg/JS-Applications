import { html } from "../../../../../node_modules/lit-html/lit-html.js";
import { getAllItems } from "../api/data.js";

export async function catalogView(ctx) {
    const items = await getAllItems();
    ctx.render(catalogTemp(items));
}

function catalogTemp(data) {
    return html`
    <div class="row space-top">
        <div class="col-md-12">
            <h1>Welcome to Furniture System</h1>
            <p>Select furniture from the catalog to view details.</p>
        </div>
    </div>
    <div class="row space-top">
        ${Object.values(data).map(e => createItem(e))}
    </div>`
}

function createItem(data) {
    return html`
    <div class="col-md-4">
        <div class="card text-white bg-primary">
            <div class="card-body">
                <img src="./images/table.png" />
                <p>Description here</p>
                <footer>
                    <p>Price: <span>235 $</span></p>
                </footer>
                <div>
                    <a href="#" class="btn btn-info">Details</a>
                </div>
            </div>
        </div>
    </div>`
}