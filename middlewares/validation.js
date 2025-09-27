
const { body, validationResult } = require('express-validator')

const signUpValidator = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('username').isLength({ min: 3 }),

    async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(404).render('user/signup', { success: null, error: 'Validation error' })

        }
        next()
    }
]

const loginValidator = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),

    async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            res.status(404).render('user/login', { success: null, error: 'Validation error' })
        }

        next()
    }
]
module.exports = { signUpValidator, loginValidator }