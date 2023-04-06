import onChange from 'on-change';
import { renderSearchingProcess, renderError, renderFeeds, renderTopics, renderSuccess, renderPostsContainer, renderModalWindowContent, renderViewedPosts } from './render.js';


export default (state) => onChange(state, (path, value) => {

    // Errors
    switch (path) {
        case 'error':
            renderError(value);
            break;
    // Success
        case 'success':
            renderSuccess();
            break;

    // Searching
        case 'searchingProcess':
            renderSearchingProcess(value);
            break;

    // Show Feeds
        case 'feedsList':
            renderFeeds(value);
            
            break;
    // Show Topics
        case 'topics':
            renderPostsContainer();
            renderTopics(value, state.shownFeed);
            renderViewedPosts(state.openedPosts)
            break;
    // Show content in modal window
        case 'currentPost':
            console.log(value)
            renderModalWindowContent(value);
            break;
    // Show opened posts flag
        case 'openedPosts':
            renderViewedPosts(value);
            break;
    // Filter topics by feed
        case 'shownFeed':
            renderPostsContainer();
            renderTopics(state.topics, value);
            renderViewedPosts(state.openedPosts)
            break;
        default:
            break;

    }
    

});

