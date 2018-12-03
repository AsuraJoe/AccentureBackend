const db = require('../_helpers/db');
const form = db.Form;

module.exports = {
    create,
    getAll,
    getByID,
    getByUserID
};

async function create (formParam){
    const form = new Form(formParam);

    await form.save();
};

async function getAll (){
    return await form.find();
};

async function getByID (id){
    return await form.findById(id).select('-hash');
};

async function getByUserID (user_id) {
    return await form.find({ user_id: user_id });
}