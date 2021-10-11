const toTitleCase = (string_: string) => string_.split(' ').map(word => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ');

export default toTitleCase;
