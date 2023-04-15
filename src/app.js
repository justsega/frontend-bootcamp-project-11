import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import uniqid from 'uniqid';
import watcher from './view.js';
import rssParser from './rssReader.js';
import validate from './validation.js';
import languages from './locales/index.js';

const form = document.querySelector('form');
const inputField = document.querySelector('#url-input');
const btn = document.querySelector('[aria-label="add"]');
const corsLink = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const feedParser = (document) => {
  const feedTitle = document.querySelector('channel title').textContent;
  const feedDescription = document.querySelector('channel description').textContent;

  return { feedTitle, feedDescription };
};

const postsParser = (document) => {
  const feedName = document.querySelector('title').textContent;
  const topics = [...document.querySelectorAll('item')];
  const topicsList = topics.map((topic) => {
    const title = topic.querySelector('title').textContent;

    const link = topic.querySelector('link').textContent;

    const description = topic.querySelector('description').textContent;

    return {
      feedName, title, description, link,
    };
  });

  return topicsList;
};
const setId = (list) => {
  list.forEach((listItem) => {
    listItem.id = uniqid();
    return listItem;
  });
  return list;
};

const markLinks = (watchedState) => {
  const topicsContainer = document.querySelector('.posts');
  const hrefs = topicsContainer.querySelectorAll('a');
  hrefs.forEach((ref) => {
    ref.addEventListener('click', (e) => {
      const parentNode = e.target.closest('li');
      const { id } = parentNode;
      if (watchedState.viewedPosts.includes(id)) {
        return;
      }
      watchedState.viewedPosts.push(id);
    });
  });
};

const showModalWindow = (watchedState) => {
  const topicsContainer = document.querySelector('.posts');
  const buttons = topicsContainer.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const parentNode = e.target.closest('li');
      const { id } = parentNode;
      watchedState.currentPost = watchedState.topics.find((t) => t.id === id);
      if (watchedState.viewedPosts.includes(id)) {
        return;
      }
      watchedState.viewedPosts.push(id);
    });
  });
  markLinks(watchedState);
};

const shownFeed = (watchedState) => {
  const feedsContainer = document.querySelector('.feeds');
  const allFeeds = feedsContainer.querySelector('h2');
  const feeds = feedsContainer.querySelectorAll('li');
  feeds.forEach((feed) => {
    feed.addEventListener('click', (e) => {
      const parentNode = e.target.closest('li');
      const feedTitle = parentNode.querySelector('h3').textContent;
      watchedState.shownFeed = feedTitle;
      showModalWindow(watchedState);
      markLinks(watchedState);
    });
  });
  allFeeds.addEventListener('click', () => {
    watchedState.shownFeed = null;
    showModalWindow(watchedState);
    markLinks(watchedState);
  });
};

const errorHandler = (err, watchedState, i18n) => {
  switch (err.name) {
    case 'AxiosError':
      watchedState.error = i18n.t('axiosErrors.errorNetwork');
      break;
    case 'ValidationError':

      if (err.message.includes('not be one of')) {
        watchedState.error = i18n.t('validationErrors.errorAlreadyExists');
        break;
      }
      if (err.message.includes('be at least')) {
        watchedState.error = i18n.t('validationErrors.errorEmptyInput');
        break;
      }
      watchedState.error = i18n.t('validationErrors.errorInvalidUrl');
      break;
    case 'ParsingError':
      watchedState.error = i18n.t('parsingErrors.errorParsing');
      break;
    case 'InvalidRssError':
      watchedState.error = i18n.t('axiosErrors.errorInvalidRss');
      break;
    default:
      break;
  }
};

const updateRss = (watchedState, i18n) => {
  const promisies = watchedState.urlList.map((url) => {
    const promise = axios.get(`${corsLink}${url}`, { timeout: 5000 })
      .then((response) => rssParser(response))
      .catch((err) => errorHandler(err, watchedState, i18n));
    return promise;
  });
  Promise
    .all(promisies)
    .then((documents) => {
      const document = documents.map((doc) => {
        const posts = postsParser(doc);
        const newPostsLinks = posts.map((p) => p.link);
        const oldPostsLinks = watchedState.topics.map((p) => p.link);
        const diffLinks = _.differenceWith(newPostsLinks, oldPostsLinks, _.isEqual);
        if (diffLinks.length === 0) {
          return null;
        }
        const newTopics = diffLinks.map((link) => {
          const p = posts.find((post) => {
            post = post.link === link;
            return post;
          });
          return p;
        });
        const newTopicsWithId = setId(newTopics);
        watchedState.topics.unshift(...newTopicsWithId.flat());
        showModalWindow(watchedState);
        markLinks(watchedState);
        return document;
      });
    })
    .catch((err) => errorHandler(err, watchedState, i18n));
};

export const startUpdate = (watchedState, i18n) => {
  setTimeout(() => {
    updateRss(watchedState, i18n);
    startUpdate(watchedState, i18n);
  }, 5000);
};

const addFeed = (watchedState, i18n) => {
  watchedState.status = 'searching';
  validate(watchedState.formInput, watchedState.urlList)
    .then((url) => {
      watchedState.urlList.push(url);
      const response = axios.get(`${corsLink}${url}`, { timeout: 5000 });
      return response;
    })
    .then((response) => {
      if (response.status !== 200) {
        watchedState.urlList.pop();
        const e = new Error();
        e.name = 'InvalidRssError';
        throw e;
      }
      const document = rssParser(response);
      const feed = feedParser(document);
      const posts = postsParser(document);
      setId(posts);
      watchedState.topics.unshift(...posts);
      watchedState.feedsList.unshift(feed);
      watchedState.status = 'success';
      showModalWindow(watchedState);
      markLinks(watchedState);
      shownFeed(watchedState);
      startUpdate(watchedState, i18n);
    })
    .catch((err) => {
      errorHandler(err, watchedState, i18n);
      watchedState.status = 'error';
    });
};

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    resources: languages.ru,
  });

  const state = {
    formInput: null,
    urlList: [],

    status: null,
    error: null,

    updatingTimer: false,

    shownFeed: null,
    currentPost: null,
    viewedPosts: [],

    feedsList: [],
    topics: [],

  };

  const watchedState = watcher(state, i18n);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.formInput = inputField.value;
    form.reset();
    inputField.focus();
    addFeed(watchedState, i18n);
  });
};
