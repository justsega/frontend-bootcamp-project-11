export const renderSuccess = (i18n) => {
  const inputField = document.querySelector('#url-input');
  inputField.classList.remove('is-invalid');
  const p = document.querySelector('.feedback');
  p.classList.replace('text-danger', 'text-success');
  p.textContent = '';
  p.textContent = i18n.t('succsess');
};

export const renderError = (value) => {
  const inputField = document.querySelector('#url-input');
  const p = document.querySelector('.feedback');
  p.classList.replace('text-success', 'text-danger');

  inputField.classList.add('is-invalid');
  p.textContent = value;
};

export const renderSearchingProcess = (value) => {
  const inputField = document.querySelector('#url-input');
  const btn = document.querySelector('[aria-label="add"]');
  if (!value) {
    btn.removeAttribute('disabled');
    inputField.removeAttribute('readonly');
    return;
  }
  btn.setAttribute('disabled', '');
  inputField.setAttribute('readonly', 'true');
};
export const renderFeedsContainer = (i18n) => {
  const feedsBlock = document.querySelector('.feeds');
  feedsBlock.innerHTML = '';

  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18n.t('ui.feeds');

  const description1 = document.createElement('p');
  description1.classList.add('fs-6', 'text');
  description1.innerHTML = 'Выберите RSS ленту.';

  cardBody.append(title);
  cardBody.append(description1);

  feedsCard.append(cardBody);
  feedsBlock.prepend(feedsCard);
};
export const renderFeeds = (value) => {
  const feedsCard = document.querySelector('.feeds .card');
  value.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.setAttribute('feedname', feed.feedTitle);

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
  });
};

export const renderActiveFeed = (value) => {
  const feeds = document.querySelector('.feeds');
  const feedsItems = feeds.querySelectorAll('li');
  feedsItems.forEach((item) => {
    item.classList.remove('border', 'border-primary', 'rounded-4');
    item.classList.add('border-0', 'border-end-0');
  });
  if (value !== null) {
    const activeFeed = feeds.querySelector(`[feedname="${value}"]`);
    activeFeed.classList.remove('border-0', 'border-end-0');
    activeFeed.classList.add('border', 'border-primary', 'rounded-4');
  }
};

export const renderModalWindowContent = (value) => {
  const { title } = value;
  const { link } = value;
  const { description } = value;

  const modal = document.querySelector('#modal');
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const btn = modal.querySelector('.full-article');

  modalTitle.innerHTML = title;
  modalBody.innerHTML = description;
  btn.setAttribute('href', `${link}`);
};

export const renderViewedPosts = (value) => {
  if (value.length !== 0) {
    value.forEach((id) => {
      const a = document.querySelector(`#${id} a`);
      if (a === null) {
        return;
      }
      a.classList.replace('fw-bold', 'fw-normal');
      a.classList.add('link-secondary');
    });
  }
};

export const renderPostsContainer = (i18n) => {
  const topicsBlock = document.querySelector('.posts');
  topicsBlock.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('ui.posts');

  cardBody.append(h2);
  card.append(cardBody);
  topicsBlock.append(card);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);
};

export const renderTopics = (topics, i18n, filter = null) => {
  if (filter !== null) {
    topics = topics.filter((t) => t.feedName === filter);
  }
  const ul = document.querySelector('.posts ul');
  ul.innerHTML = '';
  topics.forEach((topic) => {
    const { feedName } = topic;
    const { id } = topic;
    const { title } = topic;
    const { link } = topic;

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    li.setAttribute('id', id);
    li.setAttribute('feedName', feedName);

    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.textContent = title;
    a.dataset.id = 2;
    a.setAttribute('href', `${link}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = 2;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('ui.view');

    li.append(a);
    li.append(button);
    ul.append(li);
  });
};
