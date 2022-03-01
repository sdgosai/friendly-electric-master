const fastsms = require("fast-two-sms")

exports.fast2sms = async ({ message, contactNumber }, next) => {
  try {
    const res = await fastsms.sendMessage({
      authorization: process.env.FAST2SMS,
      message,
      numbers: [contactNumber],
    });
    console.log(res);
  } catch (error) {
    next(error);
  }
};