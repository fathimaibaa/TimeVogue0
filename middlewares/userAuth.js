
const User = require('../models/userModel')

async function ensureAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {
        if (req.user.id) {   
            const user = await isBlockCheck(req.user.id);
            if(user.isBlock) {   
                req.logout(function (err) {
                    if (err) {
                        next(err);
                    }
                })
                res.redirect('/login')

            }else {
                
                next();
            }
        }
    }else{
        res.redirect('/login')
    }
}


function ensureNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('back')

    } else {
        next()
    }
}

const isBlockCheck = async (id) => {
    const isBlockChecking = await User.findOne({ _id: id });
    return isBlockChecking;
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated }
