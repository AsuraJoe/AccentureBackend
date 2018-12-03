const express = require ('express');
const router = express.Router();
const formService = require('./form.service');
const db = require('../_helpers/db');
var form = db.Form;

//routes
router.get('/', getAll);
router.post('/submit', create);
router.get('/userforms/:id', getByUserID);


module.exports = router;
//api functions
function getAll(req, res, next){
    formService.getAll()
        .then(forms => res.json(forms))
        .catch(err => next(err));
};

function create(req, res, next){
    formService.create(req.body)
        .then(form => form ? res.json(form) : res.sendStatus(404))
        .catch(err => next(err));
};

function getByUserID(req, res, next){
    formService.getByUserID(req.params.user_id)
        .then(forms => res.json(forms))
        .catch(err => next(err));
}