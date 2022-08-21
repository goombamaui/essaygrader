import mongoose, {Schema, model} from "mongoose";

let DATABASE_URI='mongodb://localhost:27017';

mongoose.connect(DATABASE_URI);

const db=mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const StudentSchema = new Schema({
    name:{type:String,unique:true},
    token:String,
    essay:String,
    grade:Number,
    feedback:Object,
    tokens:Object
})

export interface Student {
    name:string,
    token:string,
    essay:string,
    grade:number,
    feedback:any,
    tokens:any
}

export default model<Student>("StudentModel", StudentSchema)
