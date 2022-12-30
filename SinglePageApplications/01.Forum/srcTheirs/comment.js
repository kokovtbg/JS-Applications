import { request } from "../helpers/httpReques.js";
import { onSubmit } from "./addComment.js";
import { getComments } from "./getAllComments.js";

export async function postComment(e){
    const main = document.querySelector('main');
    let id = e.target.id
    let url = `http://localhost:3030/jsonstore/collections/myboard/posts/${id}`;
    let response = await request(url)
    let html = `
    <div class="container">
        <!-- theme content  -->
        <div class="theme-content">
            <!-- theme-title  -->
            <div class="theme-title">
                <div class="theme-name-wrapper">
                    <div class="theme-name">
                        <h2>${response.topicName}</h2>
                    </div>
                </div>
            </div>
            <!-- comment  -->
            <div class="comment">
                <div class="header">
                    <img src="./static/profile.png" alt="avatar">
                    <p><span>${response.username}</span> posted on <time>${response.dateAndTime}</time></p>
    
                    <p>${response.postText}</p>
                </div>
            </div>
            <div class="answer-comment">
                <p><span>currentUser</span> comment:</p>
                <div class="answer">
                    <form>
                        <textarea name="postText" id="comment" cols="30" rows="10"></textarea>
                        <div>
                            <label for="username">Username <span class="red">*</span></label>
                            <input type="text" name="username" id="username">
                        </div>
                        <button>Post</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;
    main.innerHTML = html;

    const divComment = main.querySelector('div.comment');
    const form = main.querySelector('form');
    const btnPost = form.querySelector('button');
    btnPost.addEventListener('click', async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        form.reset();
        let response = await onSubmit(formData, id);
        let html =`
        <div id="user-comment">
            <div class="topic-name-wrapper">
                <div class="topic-name">
                    <p><strong>${response.username}</strong> commented on <time>${response.dateAndTime}</time></p>
                    <div class="post-content">
                        <p>${response.postText}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        divComment.innerHTML += html
    })

    let comments = await getComments(id);
    comments.forEach(el=>{
        let html =`
        <div id="user-comment">
            <div class="topic-name-wrapper">
                <div class="topic-name">
                    <p><strong>${el.username}</strong> commented on <time>${el.dateAndTime}</time></p>
                    <div class="post-content">
                        <p>${el.postText}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        divComment.innerHTML += html
    })

}