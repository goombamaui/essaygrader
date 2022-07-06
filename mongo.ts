import mongoose, {Schema, model} from "mongoose";

let DATABASE_URI='mongodb://localhost:27017';

mongoose.connect(DATABASE_URI);

const db=mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const StudentSchema = new Schema({
    name:{type:String,unique:true},
    essay:String,
    grade:Number,
    feedback:Object,
    tokens:Object
})

export default model("StudentModel", StudentSchema)
