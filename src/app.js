import validate from './validation.js';
import { rssParser, feedParser, postsParser } from './rssReader.js';
import axios from 'axios';
import watcher from './view.js';
import _ from 'lodash';
import uniqid from 'uniqid';
import  i18next  from 'i18next';
import {map} from 'async';

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

const updateRss = (watchedState) => {
    const promisies = watchedState.formInput.urlList.map((url) => {
        const promise =  getResponse(url)
        .then(response => rssParser(response))             
        .catch(err => errorHandler(err, watchedState))
        return promise;
    })
    Promise
        .all(promisies)
        .then(parsedResponse => parsedResponse
        .map((doc) => postsParser(doc)))
        .then((feeds) => feeds
        .map((feed) =>  _.differenceWith(feed, watchedState.topics, _.isEqual)))
        .then(diffArr => {
            if (diffArr.length === 0) {
                return;
            }
            return diffArr;
        })
        .then((diffArr) => watchedState.topics.unshift(...diffArr.flat()))
        .catch(err => errorHandler(err, watchedState));
      setTimeout(() => updateRss(watchedState), 5000);
  
}

const addFeed = (watchedState) => {
    refreshState(watchedState);
    urlValidation(watchedState)
        .then(url => getResponse(url))
        .then(response => rssParser(response))
        .then(document => feedParser(document))
        .then(feed => {
            watchedState.feedsList
        .unshift(feed);
        })
        .then()
        .then(() => {
            watchedState.success = true;
            watchedState.searchingProcess = false;
            //updateRss(watchedState);
        })
        .then(() => updateRss(watchedState))
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
        const patentNode = e.target.closest('li');
        const a = patentNode.querySelector('a');
        const openedTopic = (watchedState.topics.filter(topic => topic.link === a.getAttribute('href')));
        watchedState.currentPost = openedTopic;
        watchedState.openedPosts.push(...openedTopic);
        
        
    });
}




