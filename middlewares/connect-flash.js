
// connectFlash.js

function connectFlash(req, res, next) {

    res.locals.success = req.flash('success')[0] || null;
    res.locals.error = req.flash('error')[0] || null;

    // Log to see it working
    if (res.locals.error) {
        console.log('connectFlash Middleware - Error:', res.locals.error);
    }
    if (res.locals.success) {
        console.log('connectFlash Middleware - Success:', res.locals.success);
    }
    
    next();
}

module.exports = connectFlash