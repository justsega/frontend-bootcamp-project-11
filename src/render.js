export const renderSuccess = () => {
    const inputField = document.querySelector('#url-input');
    inputField.classList.remove('is-invalid');
    const p = document.querySelector('.feedback');
    p.classList.replace('text-danger', 'text-success');
    p.textContent = '';
    p.textContent = 'RSS успешно загружен';
    
}

export const renderError = (value) => {
    const inputField = document.querySelector('#url-input');
    const p = document.querySelector('.feedback');
    p.classList.replace('text-success', 'text-danger');
    
    inputField.classList.add('is-invalid');
    p.textContent = value;  
}

export const renderSearchingProcess = (value) => {
    const inputField = document.querySelector('#url-input')
    const btn = document.querySelector('[aria-label="add"]');
    if (!value) {
        btn.removeAttribute('disabled', '');
        inputField.removeAttribute('readonly', 'true')
        return;
    }
    btn.setAttribute('disabled', '');
    inputField.setAttribute('readonly', 'true')
}

export const renderFeeds = (value) => {
    const feedsBlock = document.querySelector('.feeds');
    feedsBlock.innerHTML = '';

    const feedsCard = document.createElement('div');
    feedsCard.classList.add('card', 'border-0');
    
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    
    const title = document.createElement('h2');
    title.classList.add('card-title', 'h4');
    title.textContent = 'Фиды';

    cardBody.append(title);
    feedsCard.append(cardBody);
    feedsBlock.prepend(feedsCard);

    value.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'border-0', 'border-end-0');

        const h3 = document.createElement('h3');
        h3.classList.add('h6', 'm-0');
        h3.textContent = feed.feedTitle;

        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = feed.feedDescription;

        const ul = document.createElement('ul');
        ul.classList.add('list-group', 'border-0', 'rounded-0');

        li.append(h3, p);
        ul.append(li);
        feedsCard.append(ul);
    })
}

export const renderModalWindowContent = (value) => {
    const openedTopic = value;
    const [topic] = openedTopic;
    const title = topic.title;
    const link = topic.link;
    const description = topic.description;

    const modal = document.querySelector('#modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    const btn = modal.querySelector('.full-article');
        
    modalTitle.textContent = title;
    modalBody.textContent = description;
    btn.setAttribute('href', `${link}`);

}

export const renderViewedPosts = (value) => {
    const postsContainer = document.querySelector('.posts');
    value.forEach((post) => {
        const a = postsContainer.querySelector(`[href="${post.link}"]`);
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'link-secondary');
    })
    
}

export const renderPostsContainer = () => {
    const topicsBlock = document.querySelector('.posts');
    topicsBlock.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('card', 'border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = 'Посты';

    cardBody.append(h2);
    card.append(cardBody);
    topicsBlock.append(card);
    
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(ul);
}

export const renderTopics = (value) => {
    
    const ul = document.querySelector('.posts ul');
    value.forEach((topic) => {
        const title = topic.title;
        const link = topic.link;

        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        
        const a = document.createElement('a');
        a.classList.add('fw-bold');
        a.textContent = title;
        a.dataset.id = 2;
        a.setAttribute('href', `${link}`);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer')
        
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.dataset.id = 2;
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#modal';
        button.textContent = 'Просмотр';


        li.append(a);
        li.append(button);
        ul.append(li);
        
         
    })    
}


