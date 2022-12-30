import { onSubmit } from './createPost.js';
import { loadPost } from './load.js';



(() => {
    const form = document.querySelector('form');
    const btnCancel = document.querySelector('button.cancel');
    const btnPost = document.querySelector('button.public');


    btnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        form.reset();
    })

    btnPost.addEventListener('click', async(e)=>{
        e.preventDefault();
        const formData = new FormData(form);
        form.reset();
        await onSubmit(formData);
        loadPost();
    })
    loadPost();

})();