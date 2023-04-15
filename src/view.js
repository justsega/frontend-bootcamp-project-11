import onChange from 'on-change';
import { startUpdate } from './app.js';
import {
  renderSearchingProcess, renderError, renderFeeds, renderTopics, renderSuccess,
  renderPostsContainer, renderModalWindowContent, renderViewedPosts, renderActiveFeed,
  renderFeedsContainer,
} from './render.js';

export default (state, i18n) => onChange(state, (path, value) => {
  // Errors
  switch (path) {
    // Status
    case 'status':
      if (value === 'searching') {
        renderSearchingProcess(true);
        break;
      }
      if (value === 'error') {
        renderSearchingProcess(false);
        renderError(state.error);
        break;
      }
      if (value === 'success') {
        renderSearchingProcess(false);
        renderSuccess(i18n);
        break;
      }
      break;
    // Show Feeds
    case 'feedsList':
      renderFeedsContainer(i18n);
      renderFeeds(value);
      break;
    // Show Topics
    case 'topics':
      renderPostsContainer(i18n);
      renderTopics(value, i18n, state.shownFeed);
      renderViewedPosts(state.viewedPosts);
      break;
    // Show content in modal window
    case 'currentPost':
      renderModalWindowContent(value);
      break;
    // Show opened posts flag
    case 'viewedPosts':
      renderViewedPosts(value);
      break;
    // Start updating
    case 'updatingTimer':
      startUpdate(state, i18n);
      break;
    // Filter topics by feed
    case 'shownFeed':
      renderPostsContainer(i18n);
      renderTopics(state.topics, i18n, value);
      renderViewedPosts(state.viewedPosts);
      renderActiveFeed(value);
      break;
    default:
      break;
  }
});
