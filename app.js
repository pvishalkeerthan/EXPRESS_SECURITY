const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const methodoveride=require('method-override')

mongoose.connect('mongodb://127.0.0.1:27017/Student');
let std=mongoose.Schema({
    name:String,
    rollno:String,
    course:String
})
const Student=mongoose.model('Student',std);

app.use(express.urlencoded({extended:true}))
app.use(methodoveride('_method'))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))


app.get('/',(req,res)=>{
    res.send('HELLO');
})

app.get('/studentsn',async (req,res)=>{
    let a=await Student.find();
    try{
    res.render("table",{a});
}
    catch(e){
        res.status(500).send('errpor');
    }
})
app.get('/students',async (req,res)=>{
    
    try{
    res.render("home");
}
    catch(e){
        res.status(500).send('errpor');
    }
})

app.post('/students',async(req,res)=>{
    const {name,rollno,course}=req.body;
    const newsch=new Student({name,rollno,course});
    try{
        let b=await newsch.save();
       res.redirect('/studentsn');
    }
    catch(e){
        res.status(500).send("error in post");
    }
})
app.get('/students/:id/edit',async (req,res)=>{
    const {id}=req.params;
    try{
        const student=await Student.findById(id);
        res.render('update',{student});
    }
    catch(e){
        res.status(e).send("error")
    }
})
app.put('/students/:id',async (req,res)=>{
    const {id}=req.params;
    const {name,rollno,course}=req.body;
    try{
        const st=await Student.findByIdAndUpdate(id,{name,rollno,course},{new:true});
        res.redirect('/studentsn')
    }
    catch(e){
        res.status(500).send("error in put");
    }
})

app.listen(3000,()=>{
    console.log("listening on 3000");
})  