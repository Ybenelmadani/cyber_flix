const axios = require('axios');
axios.get('https://api.themoviedb.org/3/search/tv?api_key=e7a607dd2934ebf88e36edbf8587d609&query=House+of+the+dragon')
  .then(r => console.log(JSON.stringify(r.data.results[0], null, 2)))
  .catch(console.error);
