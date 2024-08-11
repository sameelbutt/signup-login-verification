let catchasync=require('./../utils/catchasync')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/model');
const sendEmail = require('../utils/email');
exports.signup=catchasync (async (req,res)=>{
    const verificationCode = crypto.randomBytes(3).toString('hex')
let user=await User.create({
    name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      verificationCode,
      verificationCodeExpires:Date.now() + 10 * 60 * 1000 
})
const message = `Your verification code is ${verificationCode}. It will expire in 10 minutes.`;

await sendEmail({
  email: user.email,
  subject: 'Your Verification Code',
  message
});

res.json({
    status: 'success',
      message: 'Verification code sent to email!',
    user
})
})
exports.verifyAccount = catchasync(async (req, res) => {
let user=await User.findOne({
    verificationCode:req.body.verificationCode,
    verificationCodeExpires: { $gt: Date.now() }
})
if(!user){
    return res.json({
        status: 'failed',
      message: 'Verification not valid',
    })
}
user.isVerified = true;
user.verificationCode = undefined;
user.verificationCodeExpires = undefined;
await user.save({ validateBeforeSave: false });
res.status(200).json({
    status: 'success',
    message: 'Account verified successfully!'
  });

})
exports.login = catchasync(async (req, res) => { 
  const { email, password } = req.body;

  // 1) Check if user exists & password is correct
  let user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password',
    });
  }

  // 2) Check if user is verified
  if (!user.isVerified) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please verify your account first',
    });
  }

  // 3) If everything is okay, send token to client
  let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});
