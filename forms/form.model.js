const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    ssn: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    pob: { type: String, required: true },
    publicRecord: { type: String, required: true },
    religiousRecord: { type: String, required: true },
    citizenship: { type: Boolean, required: true },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Form', schema);