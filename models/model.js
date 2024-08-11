const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  verificationCode: String,
  verificationCodeExpires: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
});


userSchema.pre('save', async function(next) {
  
  if (!this.isModified('password')) return next();

 
  this.password = await bcrypt.hash(this.password, 12);


  this.passwordConfirm = undefined;
  next();
});



userSchema.methods.correctPassword=async function(candidatepass,userpass){
return await bcrypt.compare(candidatepass,userpass)

}
const User = mongoose.model('User', userSchema);
module.exports = User;
