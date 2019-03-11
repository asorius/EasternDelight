const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Comment = require('./db_models/comment');

const schema = buildSchema(`
    type Comment {
        _id:ID!
        title: String!
        text: String!
        date: String!
    }
    input CommentInput {
        title:String!
        text:String!
        date:String!
    }
    type RootQuery {
        comments: [Comment!]!
    }
    type RootMutation {
        createComment(commentInput:CommentInput):Comment
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

const resolver = {
  comments: async () => {
    try {
      const comments = await Comment.find();
      return comments;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  createComment: async args => {
    const comment = new Comment({
      title: args.commentInput.title,
      text: args.commentInput.text,
      date: new Date(args.commentInput.date)
    });
    try {
      const result = await comment.save();
      return result;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
};

const app = express();
app.use(bodyParser.json());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true
  })
);

//launches server just after successfull connection to mongodb
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-zcd64.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => app.listen(4000, () => console.log('server is up on 4000s')))
  .catch(e => console.log(e));
