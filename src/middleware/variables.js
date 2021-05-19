module.exports = function (req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated;
    res.locals.uid = req.session.uid;
    next();
}