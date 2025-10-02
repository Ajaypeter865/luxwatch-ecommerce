
const { body, validationResult } = require('express-validator')

const signUpValidator = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('username').isLength({ min: 3 }),
    body('phone').isLength({ min: 10 }),

    async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(404).render('user/signup', { success: null, error: 'Validation error' })

        }
        next()
    }
]

const loginValidator = [

   
    body('identifier').notEmpty().withMessage('Email or phone is required')
    .custom(async value => {
        const userEmail = /\S+@\S+\.\S+/.test(value)
        const userPhone = /^[0-9]{10,13}$/.test(value)

        if(!userEmail && !userPhone){
            throw new error('Must be a vaild email or phone.No')
        }
        return true
    }),

    body('password').notEmpty().withMessage('Password must be required'),


    async (req, res, next) => {
        const error = validationResult(req)
        console.log('Func from loginValidator :', error);
        
        if (!error.isEmpty()) {
            return res.status(404).render('user/login', { success: null, error: 'Validation error' })
        }

        next()
    }
    
]

module.exports = { signUpValidator, loginValidator }