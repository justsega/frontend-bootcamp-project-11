import validate from './validation.js';
import { rssParser } from './rssReader.js';
import axios from 'axios';
import watcher from './view.js';
import _ from 'lodash';
import  i18next  from 'i18next';
import uniqid from 'uniqid';

const form = document.querySelector('form');
const inputField = document.querySelector('#url-input');
const btn = document.querySelector('[aria-label="add"]');
//const topicsContainer = document.querySelector('.posts');

const feedParser = (document) => {

    if (document === null) {
        const error = new Error('ERRor in feedParsing');
        error.name = 'ParsingError';
        throw error;
    }
    const feedTitle = document.querySelector('channel title').textContent;
    const feedDescription = document.querySelector('channel description').textContent;

    return { feedTitle: feedTitle, feedDescription: feedDescription };
}

const postsParser = (document) => { 
    
    const feedName = document.querySelector('title').textContent;
    const topics = [...document.querySelectorAll('item')];
    const topicsList = topics.map((topic) => {
        
        const title = topic.querySelector('title').textContent;
        
        const link = topic.querySelector('link').textContent;
        
        const description = topic.querySelector('description').textContent;
        
        return {
             feedName: feedName, title: title, description: description, link: link,
        }
    })
    
    return topicsList;
}
const setId = (list) => {
    list.forEach((l) => l.id = uniqid());
    return list;
}

const refreshState = (watchedState) => {
    watchedState.error = null;
    watchedState.success = false;
}

const urlValidation = (watchedState) => {
    return validate(watchedState.formInput.url, watchedState.formInput.urlList)
                .then(url => {
                    watchedState.formInput.urlList.push(url);
                    return url;
                })
                
}

const getResponse = (url, watchedState) => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
                .then((response) => {
                    if (response.data.status.http_code === 404) {
                        watchedState.formInput.urlList.pop();
                        const e = new Error();
                        e.name = 'InvalidRssError';
                        throw e;
                    }
                return response;
                });
            
}

const addFeed = (watchedState) => {
    watchedState.searchingProcess = true;
    refreshState(watchedState);
    urlValidation(watchedState)
        .then(url => getResponse(url, watchedState))
        .then(response => {
            const document = rssParser(response);
            const feed = feedParser(document);
            const posts = postsParser(document)   
            setId(posts);
            watchedState.topics.unshift(...posts);
            watchedState.feedsList.unshift(feed);
            watchedState.success = true;
            watchedState.searchingProcess = false;
            showModalWindow(watchedState);
            markLinks(watchedState);
            shownFeed(watchedState);
            updateRss(watchedState);
            
        })
        .catch(err => {
            errorHandler(err, watchedState);
            watchedState.searchingProcess = false;
        });
}

const updateRss = (watchedState) => {
   
    const promisies = watchedState.formInput.urlList.map((url) => {
        
        const promise =  getResponse(url, watchedState)
        .then(response => rssParser(response))             
        .catch(err => errorHandler(err, watchedState))
        return promise;
    })
    Promise
        .all(promisies)
        .then(document => document.map((doc) => {
            const posts = postsParser(doc);
            const newPostsLinks = posts.map((p) => p.link);
            const oldPostsLinks = watchedState.topics.map((p) => p.link);
            const diffLinks = _.differenceWith(newPostsLinks, oldPostsLinks, _.isEqual);
            if (diffLinks.length === 0) {
                return;
            } else {
                const newTopics = diffLinks.map((l) => {
                
                    const p = posts.find((p) => p.link === l)
                    return p;
                });
                const newTopicsWithId = setId(newTopics);
                watchedState.topics.unshift(...newTopicsWithId.flat())
                
            }
            showModalWindow(watchedState);
            markLinks(watchedState);

        }))
        .catch(err => errorHandler(err, watchedState));
     setTimeout(() => updateRss(watchedState), 5000);
  
}



const errorHandler = (err, watchedState) => {
        switch (err.name) {
            case 'AxiosError':
                watchedState.error = 'Ошибка соединения с сервером';
                break;
            case 'ValidationError':
                
                if (err.message.includes('not be one of')) {
                    watchedState.error = 'RSS уже существует';
                    break;
                }
                if (err.message.includes('be at least')) {
                    watchedState.error = 'Не должно быть пустым';
                    break;
                }
                watchedState.error = 'Ссылка должна быть валидным URL';
                break;
            case 'ParsingError':
                watchedState.error = 'Ошибка парсинга';
                break;
            case 'InvalidRssError':
                watchedState.error = 'Ресурс не содержит валидный RSS';
                break;
            default:
                console.log(err.message)
                watchedState.error = 'Что-то пошло не так =(';
                
                break;
        }
}

const showModalWindow = (watchedState) => {
    const topicsContainer = document.querySelector('.posts');
    const buttons = topicsContainer.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const parentNode = e.target.closest('li');
            const id = parentNode.id;
            watchedState.currentPost = watchedState.topics.find(t => t.id === id);
            if (watchedState.openedPosts.includes(id)) {
                return;
            }
            watchedState.openedPosts.push(id);
            console.log(watchedState.openedPosts);
            
        })
    })
    markLinks(watchedState);
}

const markLinks = (watchedState) => {
    const topicsContainer = document.querySelector('.posts');
    const hrefs = topicsContainer.querySelectorAll('a');
    hrefs.forEach((ref) => {
        ref.addEventListener('click', (e) => {
            const parentNode = e.target.closest('li');
            const id = parentNode.id;
            if (watchedState.openedPosts.includes(id)) {
                return;
            }
            watchedState.openedPosts.push(id);
            
        })
    })
  
}

const shownFeed = (watchedState) => {
    const feedsContainer = document.querySelector('.feeds');
    const allFeeds = feedsContainer.querySelector('h2');
    const feeds = feedsContainer.querySelectorAll('li');
    feeds.forEach((feed) => {
        feed.addEventListener('click', (e) => {
            const parentNode = e.target.closest('li')
            const feedTitle = parentNode.querySelector('h3').textContent;
            console.log(feedTitle)
            watchedState.shownFeed = feedTitle;
            showModalWindow(watchedState);
            markLinks(watchedState);
        })
    })
    allFeeds.addEventListener('click', () => {
        watchedState.shownFeed = null;
        showModalWindow(watchedState);
        markLinks(watchedState);
    })
    
}



export default () => {
    const i18n = i18next.createInstance();
    i18n.init({
      lng: 'ru',
      debug: true,
      //resources: languages.ru,
    });

    const state = {
        formInput: {
            url: null,
            urlList: [],
    
        },
        success: false,
        shownFeed: null,
        currentPost: null,
        openedPosts: [],
        searchingProcess: false,
        feedsList: [],
        topics: [],
        error: null,
    }

    const watchedState = watcher(state);
    
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        watchedState.formInput.url = inputField.value;
        form.reset();
        inputField.focus();
        addFeed(watchedState);
        
    });


        
    
}




