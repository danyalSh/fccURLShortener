const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlShortSchema = new Schema({
    original : String,
    shortened : String
});

const URLShorts = mongoose.model('URLShorts', urlShortSchema);

module.exports = URLShorts;