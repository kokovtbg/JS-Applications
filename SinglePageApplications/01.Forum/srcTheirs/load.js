import { request } from "../helpers/httpReques.js";
import { postComment } from "./comment.js";

export async function loadPost(){
    const container = document.querySelector('div.topic-container');
    container.textContent = "";
    let url = 'http://localhost:3030/jsonstore/collections/myboard/posts';
    let response = await request(url);
    Object.values(response).forEach(el=>{
        let html = `
        <div class="topic-name-wrapper">
            <div class="topic-name">
                <a href="#" class="normal">
                    <h2 id = ${el._id}>${el.topicName}</h2>
                </a>
                <div class="columns">
                    <div>
                        <p>Date: <time>${el.dateAndTime}</time></p>
                        <div class="nick-name">
                            <p>Username: <span>${el.username}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML += html;
    })
    const postDetail = container.querySelectorAll('h2');
    [...postDetail].forEach(h2=>{
        h2.addEventListener('click', postComment)
    })

}