const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");
const Application = require("../models/Application");
const { STAGES } = require("../models/enums");

dotenv.config({ path: path.join(__dirname, "../.env") });

const seed = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully.");

    // Clear existing data for a fresh seed
    console.log("Clearing existing users and applications...");
    await User.deleteMany({});
    await Application.deleteMany({});
    console.log("Existing data cleared.");

    // 1. Seed Users
    const usersToSeed = [
      { name: "Admin User", email: "admin@studentflow.com", password: "Admin123!", role: "ADMIN" },
      { name: "QA Officer User", email: "qa@studentflow.com", password: "Qa123!", role: "QA_OFFICER" },
      { name: "Admission Officer User", email: "admission@studentflow.com", password: "Admission123!", role: "ADMISSION_OFFICER" },
      { name: "Visa Officer User", email: "visa@studentflow.com", password: "Visa123!", role: "VISA_OFFICER" },
      { name: "Enrolment Officer User", email: "enrolment@studentflow.com", password: "Enrolment123!", role: "ENROLMENT_OFFICER" },
      { name: "Agent User", email: "agent@test.com", password: "Agent123!", role: "AGENT" }
    ];

    const seededUsers = {};

    for (const u of usersToSeed) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        user = await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role
        });
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
      seededUsers[u.role] = user;
    }

    const agent = seededUsers["AGENT"];

    // 2. Seed Applications
    // App 1: QA Review stage, missing/unverified documents (to show block when moving to App Review)
    const app1Data = {
      studentName: "John Doe",
      studentEmail: "johndoe@test.com",
      phoneNumber: "+123456789",
      nationality: "Canadian",
      courseName: "MSc Computer Science",
      universityName: "University of Toronto",
      intakeYear: 2026,
      intakeMonth: "September",
      currentStage: STAGES.QA_REVIEW,
      agentId: agent._id,
      createdBy: agent._id,
      documents: [
        { key: "passport", name: "Passport", uploaded: false, verified: false },
        { key: "academic", name: "Academic Documents", uploaded: true, fileName: "transcripts.pdf", fileUrl: "https://example.com/transcripts.pdf", verified: true },
        { key: "englishTest", name: "English Test / IELTS", uploaded: false, verified: false },
        { key: "sop", name: "Statement of Purpose", uploaded: false, verified: false },
        { key: "cv", name: "CV / Resume", uploaded: false, verified: false }
      ]
    };

    // App 2: App Review stage, documents verified (to show AI assessment)
    const app2Data = {
      studentName: "Jane Smith",
      studentEmail: "janesmith@test.com",
      phoneNumber: "+987654321",
      nationality: "Indian",
      courseName: "MBA",
      universityName: "London Business School",
      intakeYear: 2026,
      intakeMonth: "September",
      currentStage: STAGES.APP_REVIEW,
      agentId: agent._id,
      createdBy: agent._id,
      documents: [
        { key: "passport", name: "Passport", uploaded: true, fileName: "passport.pdf", fileUrl: "https://example.com/passport.pdf", verified: true },
        { key: "academic", name: "Academic Documents", uploaded: true, fileName: "academic.pdf", fileUrl: "https://example.com/academic.pdf", verified: true },
        { key: "englishTest", name: "English Test / IELTS", uploaded: true, fileName: "ielts.pdf", fileUrl: "https://example.com/ielts.pdf", verified: false },
        { key: "sop", name: "Statement of Purpose", uploaded: true, fileName: "sop.pdf", fileUrl: "https://example.com/sop.pdf", verified: false },
        { key: "cv", name: "CV / Resume", uploaded: true, fileName: "cv.pdf", fileUrl: "https://example.com/cv.pdf", verified: false }
      ]
    };

    // App 3: Deposit stage
    const app3Data = {
      studentName: "Alice Johnson",
      studentEmail: "alicejohnson@test.com",
      phoneNumber: "+441234567",
      nationality: "British",
      courseName: "BSc Business Administration",
      universityName: "University of Manchester",
      intakeYear: 2026,
      intakeMonth: "September",
      currentStage: STAGES.DEPOSIT,
      agentId: agent._id,
      createdBy: agent._id,
      depositPaid: false,
      documents: [
        { key: "passport", name: "Passport", uploaded: true, fileName: "passport.pdf", fileUrl: "https://example.com/passport.pdf", verified: true },
        { key: "academic", name: "Academic Documents", uploaded: true, fileName: "academic.pdf", fileUrl: "https://example.com/academic.pdf", verified: true },
        { key: "englishTest", name: "English Test / IELTS", uploaded: true, fileName: "ielts.pdf", fileUrl: "https://example.com/ielts.pdf", verified: true },
        { key: "sop", name: "Statement of Purpose", uploaded: true, fileName: "sop.pdf", fileUrl: "https://example.com/sop.pdf", verified: true },
        { key: "cv", name: "CV / Resume", uploaded: true, fileName: "cv.pdf", fileUrl: "https://example.com/cv.pdf", verified: true }
      ]
    };

    const appsToSeed = [app1Data, app2Data, app3Data];

    for (const app of appsToSeed) {
      let existingApp = await Application.findOne({ studentEmail: app.studentEmail });
      if (!existingApp) {
        await Application.create(app);
        console.log(`Created application for: ${app.studentName} (${app.currentStage})`);
      } else {
        console.log(`Application already exists for: ${app.studentName}`);
      }
    }

    console.log("Database seeding finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
