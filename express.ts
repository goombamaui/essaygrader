import express from 'express';
import fileupload from 'express-fileupload'
import Grader from './grader';
import { Essay } from './Tokenizer';
import StudentModel from './mongo';
import { getTextFromPDFBuffer } from './FileHandler';


const app = express();

app.set("view engine", "ejs");
 
app.use(express.json())
app.use(fileupload())
app.use(express.static('public'));
 
app.post('/',async (req, res) => {
    let tastystring:string;
    try{
        let e=req.files?.essayfile! as any;
        tastystring="";
        switch(e.mimetype){
            case 'application/pdf':
                tastystring=await getTextFromPDFBuffer(e.data);
                tastystring.replace("\n","");
                console.log(tastystring)
                break;
            case 'text/plain':
                tastystring=e.data.toString();
                break;
            default:
                res.status(400).send({});
        }
    } catch(err){
        tastystring=req.body.essaytext;
    }
    console.log(tastystring);
    let e=new Essay(tastystring);
    let resp=Grader.GradeEssay(e);
    let feedback=resp[1].map(k=>k.toObject());
    let student=(await StudentModel.find({name: req.body.name}))[0] || new StudentModel({
        name:req.body.name,
    })
    student.grade=resp[0];
    student.feedback=feedback;
    student.essay=tastystring;
    student.tokens=e.tokens.map(k=>k.tok);
    student.save(function (err) {
        err && console.log(err);
    });
    console.log("SUCCESS");

    res.status(200).send("{}");

    //res.send(         {score:resp[0],feedback:feedback,tokens:e.tokens.map(k=>k.tok)}       ) //you happy kabir
});
app.get("/view",async (req,res)=>{
    let user=req.query.u;
    console.log(user);
    if(!user){
        return res.render(__dirname+"/public/viewessay.ejs");
    }
    let student=(await StudentModel.find({name: user}))[0];
    if(!student){
        return res.render(__dirname+"/public/viewessay.ejs",{formerror:"Student not found"})
    }
    res.render(__dirname+"/public/viewessay.ejs",{data:{
        score:student.grade,
        feedback:student.feedback,
        tokens:student.tokens
    }})
})

app.get("/",(req,res)=>{
    res.render(__dirname+"/public/index.ejs");
})

 
app.listen(80,()=>{
    console.log("at least the servers up :D");
});