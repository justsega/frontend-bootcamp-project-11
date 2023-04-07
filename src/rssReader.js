const rssParser = (response) => {
  const domParser = new DOMParser();
  const parsedResponse = domParser.parseFromString(response.data.contents, 'application/xml');
  const err = parsedResponse.querySelector('parsererror');

  if (err) {
    const error = new Error();
    error.name = 'ParsingError';
    throw error;
  }
  return parsedResponse;
};

export default rssParser;
