const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Student');

// Define Student Schema and Model
const studentSchema = mongoose.Schema({
    name: String,
    rollno: String,
    course: String
});
const Student = mongoose.model('Student', studentSchema);

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const User = mongoose.model('User', userSchema);

// Middleware and Configuration
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'));

// Routes

// Login Page
app.get('/login', (req, res) => {
    res.render("login");
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username and password match in the database
        const user = await User.findOne({ username});
        if(!user) {
            // User not found
            return res.render('login', { error: 'Invalid username or password' });
        }
        
        const checkpass=await bcrypt.compare(password,user.password);
        if(!checkpass){
            return res.render('login',{error:'Invalid username and password'});
        }
        const token = jwt.sign({userid: user._id}, "123",{ expiresIn: '1m' });
        console.log("Token generated:", token);
        res.cookie('jwt',token,{httpOnly:true});
        res.render('home');
        console.log('login successful');
    } catch (e) {s
        // Handle error
        res.status(500).send("Error in login");
    }
});

// Register Page
        app.get('/register', (req, res) => {
            res.render("register");
        });
        app.post('/register',async(req,res)=>{
            const {username,password}=req.body;
            try{
                const hashpassword=await bcrypt.hash(password,10);
                const newuser=new User({username,password:hashpassword});
                await newuser.save();
                res.redirect('login');
                console.log("Registration successful");
            }
            catch(e){   
                res.status(500).send("Error credentials");
            }
});




// View All Students Page
app.get('/studentsn', async (req, res) => {
    try {
        // Retrieve all students from the database
        const a = await Student.find();
        res.render("table", { a });
    } catch (e) {
        // Handle error
        res.status(500).send('Error: ' + e.message);
    }
});

// Home Page
app.get('/students', async (req, res) => {
    try {
        res.render("home");
    } catch (e) {
        res.status(500).send('Error: ' + e.message);
    }
});

// Add New Student Endpoint
app.post('/students', async (req, res) => {
    const { name, rollno, course } = req.body;
    const newStudent = new Student({ name, rollno, course });
    try {
        // Save new student to the database
        await newStudent.save();
        res.redirect('/studentsn');
    } catch (e) {
        // Handle error
        res.status(500).send("Error in post: " + e.message);
    }
});

// Edit Student Page
app.get('/students/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
        // Find student by ID and render edit page
        const student = await Student.findById(id);
        res.render('update', { student });
    } catch (e) {
        // Handle error
        res.status(500).send("Error: " + e.message);
    }
});

// Update Student Endpoint
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, rollno, course } = req.body;
    try {
        // Update student information in the database
        await Student.findByIdAndUpdate(id, { name, rollno, course }, { new: true });
        res.redirect('/studentsn');
    } catch (e) {
        // Handle error
        res.status(500).send("Error in put: " + e.message);
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
