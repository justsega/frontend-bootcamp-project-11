import validate from './validation.js';
import { rssParser, feedParser, postsParser } from './rssReader.js';
import axios from 'axios';
import watcher from './view.js';
import _ from 'lodash';
import  i18next  from 'i18next';
import {log, map} from 'async';
import uniqid from 'uniqid';

const form = document.querySelector('form');
const inputField = document.querySelector('#url-input');
const btn = document.querySelector('[aria-label="add"]');
const topicsContainer = document.querySelector('.posts');

const refreshState = (watchedState) => {
    watchedState.error = null;
    watchedState.success = false;
    watchedState.searchingProcess = true;
}

const urlValidation = (watchedState) => {
    return validate(watchedState.formInput.url, watchedState.formInput.urlList)
                .then(url => {
                    watchedState.formInput.urlList.push(url);
                    return url;
                })
                
}

const getResponse = (url) => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
                .then((response) => {
                    if (response.data.status.http_code === 404) {
                        const e = new Error();
                        e.name = 'InvalidRssError';
                        throw e;
                    }
                return response;
                });
            
}

const setId = (list) => {
    list.forEach((l) => l.id = uniqid());
    return list;
}

const updateRss = (watchedState) => {
    const promisies = watchedState.formInput.urlList.map((url) => {
        
        const promise =  getResponse(url)
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
        }))
        .catch(err => errorHandler(err, watchedState));
     setTimeout(() => updateRss(watchedState), 5000);
  
}

const addFeed = (watchedState) => {
    refreshState(watchedState);
    urlValidation(watchedState)
        .then(url => getResponse(url))
        .then(response => {
            const document = rssParser(response);
            const feed = feedParser(document);
            watchedState.feedsList.unshift(feed);
            watchedState.success = true;
            watchedState.searchingProcess = false;
            updateRss(watchedState)
        })
        .catch(err => {
            errorHandler(err, watchedState);
            watchedState.searchingProcess = false;
        });
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



    topicsContainer.addEventListener('click', (e) => {
        
        const buttons = topicsContainer.querySelectorAll('button');
        buttons.forEach((button) => {
            console.log('click done')
            button.addEventListener('click', (e) => {
                const parentNode = e.target.closest('li');
                const id = parentNode.getAttribute('id');
                console.log(id);
                watchedState.currentPost = id;
                watchedState.openedPosts.push(id);
                console.log(watchedState.currentPost);
            })
        })
    });
}




