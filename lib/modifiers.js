const filter = require('lodash.filter');
 
const filterBySearch = (collection, searchInput, {searchKey} = {}) => {
  let search = {};
 
  if (searchKey) {
    search[searchKey] = searchInput;
  } else if (typeof searchInput === 'bigint' || !isNaN(searchInput) && typeof BigInt(searchInput) === 'bigint') {
    search = {EntityId: String(searchInput)};
  } else if (typeof searchInput === 'object') {
    search = searchInput;
  } else if (typeof searchInput === 'string') {
    search = {DisplayName: searchInput};
  }
 
  const result = filter(collection, search);
 
  return searchInput && result.length === 1 ? result[0] : result;
};

module.exports = {
    filterBySearch
  };