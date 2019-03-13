const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Comment = require('./db_models/comment');
const User = require('./db_models/user');

const schema = buildSchema(`
    type Comment {
        _id:ID!
        title: String!
        text: String!
        date: String!
    }
    type User {
      _id: ID!
      email: String!
      password: String
    }
    input CommentInput {
        title:String!
        text:String!
        date:String!
    }
    input UserInput {
      email: String!
      password: String!
    }
    type RootQuery {
        comments: [Comment!]!
    }
    type RootMutation {
        createComment(commentInput:CommentInput): Comment
        createUser(userInput:UserInput): User
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

const resolvers = {
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
      date: new Date(args.commentInput.date),
      createdBy: '5c893d12b49c9b0f35e02d28'
    });
    try {
      const createdComment = await comment.save();
      const creator = await User.findById('5c893d12b49c9b0f35e02d28');
      if (creator) {
        creator.createdComments.push(createdComment);
        await creator.save();
        return createdComment;
      } else {
        throw new Error("That user doesn't exist");
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  createUser: async args => {
    try {
      const userAlreadyExist = await User.findOne({
        email: args.userInput.email
      });
      if (userAlreadyExist) {
        throw new Error('User exists already');
      } else {
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        const createdUser = await user.save();
        return createdUser;
      }
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
    rootValue: resolvers,
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
  .then(() =>
    app.listen(4000, () =>
      console.log(`server is up on 4000, mongo name ${process.env.MONGO_DB}`)
    )
  )
  .catch(e => console.log(e));
