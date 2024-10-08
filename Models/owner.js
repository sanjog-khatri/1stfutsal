const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OwnerSchema = new Schema({
    username : {
        type : String,
        required : true,
        },
    email : {
        type : String,
            unique : true,
            required : true,
        },
    password : {
        type : String,
        required : true,
        },
    role: {
        type: String,
        default: 'owner'
        },
    hasCreatedFutsal: {
            type: Boolean,
            default: false
        }
});

const OwnerModel = mongoose.model('Owner', OwnerSchema);
module.exports = OwnerModel;