const contactsRouter = require("./contacts/routes");
const authRouter = require("./auth/routes");
const convsRouter = require("./convs/routes");
const groupconvsRouter = require("./groupconvs/routes");
const userconvsRouter = require("./userconvs/routes");
const messagesRouter = require("./messages/routes");
const fileuploader = require("./fileupload");

const mainRouter = function(app) {
  app.use("/api/contacts", contactsRouter);
  app.use('/api/auth', authRouter);
  app.use("/api/convs", convsRouter);
  app.use("/api/groupconvs", groupconvsRouter);
  app.use("/api/userconvs", userconvsRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/fileupload", fileuploader);
};

module.exports = mainRouter;