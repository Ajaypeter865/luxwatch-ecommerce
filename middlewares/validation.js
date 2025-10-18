
const { body, validationResult } = require('express-validator');

const signUpValidator = [
  body('email')
    .isEmail()
    .trim()
    .notEmpty()
    .withMessage('Please enter a valid email address'),

  body('password')
    .isLength({ min: 5 })
    .trim()
    .notEmpty()

    .withMessage('Password must be at least 5 characters long'),

  body('username')
    .isLength({ min: 3 })
    .trim()
    .notEmpty()
    .withMessage('Username must be at least 3 characters long'),

  body('phone')
    .isLength({ min: 10 })
    .trim()
    .notEmpty()
    .withMessage('Phone number must be at least 10 digits long'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res
        .status(400)
        .render('user/signup', { success: null, error: firstError });
    }
    next();
  },
];


const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required')
    .custom(async (value) => {
      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isPhone = /^[0-9]{10,13}$/.test(value);

      if (!isEmail && !isPhone) {
        throw new Error('Must be a valid email or phone number');
      }

      return true;
    }),

  body('password')
    .notEmpty()
    .trim()
    .withMessage('Password is required'),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).render('user/login', { success: null, error: firstError });
    }

    next();
  },
];



module.exports = { signUpValidator, loginValidator }