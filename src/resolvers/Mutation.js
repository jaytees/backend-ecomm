const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );

    return item;
  }, // createItem

  updateItem(parent, args, ctx, info) {
    // first take copy of the updates
    const updates = { ...args };
    // remove the id from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  }, // updateItem

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };

    // find item
    const item = await ctx.db.query.item({ where }, `{id, title}`);
    // check if they own / have permissions
    // TODO:
    // delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  }, // deleteItem

  async signup(parent, args, ctx, info) {
    // email to toLowerCase
    args.email = args.email.toLowerCase();
    // hash password
    const password = await bcrypt.hash(args.password, 10);
    // create user in DB
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // signIn user
    // create JWT
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET);
    // we set the jwt as a cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // finally return user to browser
    return user;
  },
  // destructure args
  async signin(parent, { email, password }, ctx, info) {
    // check if user with email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // check if pword correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password');
    }
    // generate jwt token
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET);
    // set cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // return user
    return user;
  },
  signout(parent, { id }, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Signed Out Successfully' };
  },
};

module.exports = Mutations;
