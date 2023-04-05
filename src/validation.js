import * as yup from 'yup';



export default (url, list) => {
    const scheme = yup.string().url().min(1).notOneOf(list);
    return scheme.validate(url, list);

};