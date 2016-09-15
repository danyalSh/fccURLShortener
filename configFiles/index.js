module.exports = {
    'getDBConnection': function getDBConnection () {
        return process.env.MongoLabUri;
    }
};