

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





    
    
    
    
    


