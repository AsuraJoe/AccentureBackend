const db = require('../_helpers/db');
const Form = db.Form;

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
    return await Form.find();
};

async function getByID (id){
    return await Form.findById(id);
};

async function getByUserID (user_id) {
    return await Form.find({ user_id: user_id }).select('-hash');
}