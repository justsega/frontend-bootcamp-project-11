

export const rssParser = (response) => {
    const domParser = new DOMParser();

    const err = document.querySelector('parsererror');
    if (err) {
    const error = new Error();
    error.name = 'ParsingError';
    throw error;
  }
    return domParser.parseFromString(response.data.contents, 'application/xml');
    
    
}

export const feedParser = (document) => {

    if (document === null) {
        const error = new Error();
        error.name = 'ParsingError';
        throw error;
    }
    const feedTitle = document.querySelector('channel title').textContent;
    const feedDescription = document.querySelector('channel description').textContent;

    return { feedTitle: feedTitle, feedDescription: feedDescription };
}

export const postsParser = (document) => { 
    const feedName = document.querySelector('channel title').textContent;
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



    
    
    
    
    


