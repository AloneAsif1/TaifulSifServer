const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require("cors");

const XLSX = require('xlsx');
app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'https://biologysif.web.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.listen(port, () => {
  console.log("port is", port)
})
app.get('/', (req, res) => {
  res.send("server isff running")
})
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://taifulsif:taifulsif1212@cluster0.ak91fsl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db("taifulsif");
    const studentsCollection = database.collection("students");
    studentsCollection.createIndex({ id: 1 }, { unique: true });
    const usersCOllection = database.collection("users")
    const villlageCollection =database.collection("villages")
    const messCollection =database.collection("messes")
    const schoolCollection =database.collection("schools")
    const collegeCollection =database.collection("colleges")
    


async function run() {
  try {
  

    

    //get a student
    app.get('/student/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        id: id
      }
      const result = await studentsCollection.findOne(query)
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ message: 'Student not found' });
      }
    })
    // students er number er array paite ids er array diye
    app.post('/getnumbers', async (req, res) => {
      const ids = req.body
      const students = await studentsCollection
        .find({ id: { $in: ids } },)
        .toArray();

      const phoneNumbers = []
      students.map(student => {

        const obj = {
          phone: student.phone1,
          name: student.name
        }
        phoneNumbers.push(obj)
      });
      console.log(phoneNumbers)

      // send the phone numbers and names
      JSON.stringify(phoneNumbers)
      res.send(phoneNumbers);
    })


    // Search students 
    app.post('/students', async (req, res) => {
      const query = req.body
      const cursor = studentsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

 

    //Student info Download
    app.post('/download/students', async (req, res) => {
      const array = req.body
      const students =array.map(student =>({
        Id:student.id,
        Name:student.name,
        Phone_1:student.phone1,
        Phone_2:student.phone2,
        Category:student.category,
        School:student.school,
        College:student.college,
        Varsity:student.varsity,
        Date_of_Birth:student.dob,
        Date_of_Birth:student.dob,
        Permanent_Address:`${student.permanentAddress.unionName}, ${student.permanentAddress.upazilaName}, ${student.permanentAddress.districtName}`,
        Present_Address:`${student.presentAddress.mess}, ${student.presentAddress.area}`,
        Session:student.session,
        Target:student.target,
        Gurdian_Name:student.gname,
        Gurdian_Number:student.gphone,

      }))
      
      const worksheet = XLSX.utils.json_to_sheet(students);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'students');

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      const fileName = `students.xlsx`;

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(buffer);

    })


    //user add korar post
    app.post('/adduser', async (req, res) => {
      const user = req.body;
      const result = await usersCOllection.insertOne(user)
      res.send(result)
    })
    //village add korar post
    app.post('/addvillage', async (req, res) => {
      const village = req.body;
      
      const result = await villlageCollection.insertOne(village)
      console.log(result)
      res.send(result)
    })
    //mess add korar post
    app.post('/addmess', async (req, res) => {
      const mess = req.body;
      
      const result = await messCollection.insertOne(mess)
      
      res.send(result)
    })
    //school add korar post
    app.post('/addschool', async (req, res) => {
      const school = req.body;
      
      const result = await schoolCollection.insertOne(school)
      
      res.send(result)
    })
    //college add korar post
    app.post('/addcollege', async (req, res) => {
      const college = req.body;
      
      const result = await collegeCollection.insertOne(college)
      
      res.send(result)
    })

    //Update korte
    app.put('/student/update/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = {
        $set: req.body
      }
      const filter = {
        id: id
      }
      const result = await studentsCollection.updateOne(filter, updatedData)
      res.send(result)

    })

  
    //student delete korte

    app.delete('/student/delete/:id', async (req, res) => {
      const id = req.params.id
      const query = { id: id }
      const result = await studentsCollection.deleteOne(query)
      res.send(result)
    })

    // User er name nite
    app.get('/getuser/:param', async (req, res) => {
      const mail = req.params.param;
      if (mail != "null") {
        console.log(mail)
        const query = {
          email: mail
        }
        const user = await usersCOllection.findOne(query)
        res.send(user)

      }

    })

    //admission post
    app.post('/admit', async (req, res) => {
      const admissionData = req.body;

      console.log(admissionData)
      try {
        const result = await studentsCollection.insertOne(admissionData);
        res.send(result);
      } catch (error) {
        // Handle duplicate key error (11000) explicitly
        if (error.code === 11000) {
          res.status(405).send("Duplicate key error: ID must be unique.");
        } else {
          res.status(500).send("Error inserting data into MongoDB.");
        }
      }
    })
    //sob user er name array
    app.get("/getusers", async (req, res) => {
      const cursor = usersCOllection.find()
      const allUsers = await cursor.toArray()
      var allNames = []
      allUsers.map(user => {
        allNames.push(user.name)
      })
      const respond = JSON.stringify(allNames)
      res.send(respond)
    })
    //sob village nite
    app.get("/getvillages", async (req, res) => {
      const cursor = villlageCollection.find()
      const allVillages = await cursor.toArray()
      
      const respond = JSON.stringify(allVillages)
      console.log(respond)
      res.send(respond)
    })
    //sob mess nite
    app.get("/getmesses", async (req, res) => {
      const cursor = messCollection.find()
      const allMesses = await cursor.toArray()
      
      const respond = JSON.stringify(allMesses)
     
      res.send(respond)
    })
    //sob school nite
    app.get("/getschools", async (req, res) => {
      const cursor = schoolCollection.find()
      const allSchools = await cursor.toArray()
      
      const respond = JSON.stringify(allSchools)
     
      res.send(respond)
    })
    //sob college nite
    app.get("/getcolleges", async (req, res) => {
      const cursor = collegeCollection.find()
      const allColleges = await cursor.toArray()
      
      const respond = JSON.stringify(allColleges)
     
      res.send(respond)
    })

  



    
  } finally {
    // Ensures that the client will close when you finish/error

  }
}


 
run().catch(console.dir);

