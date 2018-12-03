const mongoose= require('mongoose');
const FormSchema=mongoose.Schema;

var formSchema = new FormSchema({
    user_id: {type: String, required:true},
    Name: {type: String, required: true},
    SSN: {type: String, required: true},
    Gender: {type: String, required: true},
    DoB: {type: String, required: true},
    PoB: {type: String, required: true},
    PublicRecord: {type: String, required: true},
    ReligiousRecord: {type: String, required: true},
    Citizenship: {type: Boolean, required: true},
});

formSchema.set('toJson', {virtuals: true});

module.exports= mongoose.model('Form',formSchema);