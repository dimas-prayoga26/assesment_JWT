const messagesResolvers = require('./messages');
const usersReolvers = require('./users');

module.exports = {
    Query: {
        ...messagesResolvers.Query,
        ...usersReolvers.Query
    },
    Mutation: {
        ...messagesResolvers.Mutation,
        ...usersReolvers.Mutation
    },
};