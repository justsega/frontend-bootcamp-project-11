import onChange from 'on-change';
import {
  renderSearchingProcess, renderError, renderFeeds, renderTopics, renderSuccess,
  renderPostsContainer, renderModalWindowContent, renderViewedPosts, renderActiveFeed,
} from './render.js';

export default (state, i18n) => onChange(state, (path, value) => {
  // Errors
  switch (path) {
    case 'error':
      renderError(value);
      break;
    // Success
    case 'success':
      renderSuccess(i18n);
      break;

    // Searching
    case 'searchingProcess':
      renderSearchingProcess(value);
      break;

    // Show Feeds
    case 'feedsList':
      renderFeeds(value, i18n);
      break;
    // Show Topics
    case 'topics':
      renderPostsContainer(i18n);
      renderTopics(value, i18n, state.shownFeed);
      renderViewedPosts(state.openedPosts);
      break;
    // Show content in modal window
    case 'currentPost':
      renderModalWindowContent(value);
      break;
    // Show opened posts flag
    case 'openedPosts':
      renderViewedPosts(value);
      break;
    // Filter topics by feed
    case 'shownFeed':
      renderPostsContainer(i18n);
      renderTopics(state.topics, i18n, value);
      renderViewedPosts(state.openedPosts);
      renderActiveFeed(value);
      break;
    default:
      break;
  }
});
