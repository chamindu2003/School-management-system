//wsW4977n401ML1qC

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = require("./Routes/UserRoute");
const studentRouter = require("./Routes/StudentRoute");
const teacherRouter = require("./Routes/TeacherRoute");
const attendanceRouter = require("./Routes/AttendanceRoute");
const marksRouter = require("./Routes/MarksRoute");
const studyMaterialRouter = require("./Routes/StudyMaterialRoute");
const announcementRouter = require("./Routes/AnnouncementRoute");
const classRouter = require("./Routes/ClassRoute");
const scheduleRouter = require("./Routes/ScheduleRoute");
const contactRouter = require("./Routes/ContactRoute");
const taskRouter = require("./Routes/TaskRoute");

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5001;

//Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/users",router);
app.use("/students",studentRouter);
app.use("/teachers",teacherRouter);
app.use("/attendance", attendanceRouter);
app.use("/marks", marksRouter);
app.use("/study-materials", studyMaterialRouter);
app.use("/announcements", announcementRouter);
app.use("/classes", classRouter);
app.use("/schedules", scheduleRouter);
app.use("/contact", contactRouter);
app.use("/tasks", taskRouter);


mongoose.connect("mongodb+srv://admin:wsW4977n401ML1qC@schoolmanagementsystem.pokpet9.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => console.log(err));