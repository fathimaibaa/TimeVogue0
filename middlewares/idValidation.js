const { validationResult, param } = require('express-validator');

const validateID = [
  param('id')
    .isMongoId() 
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('./shop/pages/page404');
    }
    next();
  },
];

const adminValidateID = [
  param('id')
    .isMongoId() 
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('./admin/page404',{title:'404'});
    }
    next();
  },
];




module.exports = {validateID,adminValidateID}