const express = require("express");
const Application = require("../models/Application");
const { ROLES, VALID_TRANSITIONS, ROLE_TRANSITIONS } = require("../models/enums");
const authMiddleware = require("../middleware/auth.middleware");
const aiService = require("../services/ai.service");
const actionsService = require("../services/actions.service");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            studentName,
            studentEmail,
            phoneNumber,
            nationality,
            courseName,
            universityName,
            intakeMonth,
            intakeYear,
            agentNote,
            documents,
        } = req.body || {};

        const agentId = req.query.userID;

        if (
            !studentName ||
            !studentEmail ||
            !phoneNumber ||
            !nationality ||
            !courseName ||
            !universityName ||
            !agentId
        ) {
            return res.status(400).json({
                message: "Student name, email, phone, nationality, course, university and agentId are required"
            });
        }

        const application = await Application.create({
            studentName,
            studentEmail,
            phoneNumber,
            nationality,
            courseName,
            universityName,
            intakeMonth,
            intakeYear,
            agentNote,
            documents,
            agentId,
            createdBy: req.user.id,
        });

        return res.status(201).json({
            message: "Application created successfully",
            application
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        let query = {};

        // If the logged in user is an Agent, restrict to only their applications
        if (req.user.role === "AGENT") {
            query.agentId = req.user.id || req.user._id;
        } else if (req.query.agentId) {
            query.agentId = req.query.agentId;
        }

        // Support stage filter
        if (req.query.stage) {
            query.currentStage = req.query.stage;
        }

        const applications = await Application.find(query)
            .populate("createdBy", "name email")
            .populate("agentId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Applications fetched successfully",
            applications
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

const User = require("../models/User");

router.get("/stats/dashboard", authMiddleware, async (req, res) => {
    try {
        if (req.user.role === "AGENT") {
            return res.status(403).json({ message: "Access denied" });
        }

        const totalApplications = await Application.countDocuments();
        const activeAgentsCount = await User.countDocuments({ role: "AGENT", isActive: true });
        const pendingQaCount = await Application.countDocuments({ currentStage: { $in: ["NEW_APP", "QA_REVIEW"] } });
        const pendingVisaCount = await Application.countDocuments({ currentStage: { $in: ["DEPOSIT", "CAS_REVIEW"] } });

        const stagesList = ["NEW_APP", "QA_REVIEW", "APP_REVIEW", "DECISION", "DEPOSIT", "CAS_REVIEW", "ENROLMENT"];
        const stageCountsPromises = stagesList.map(async (stage) => {
            const count = await Application.countDocuments({ currentStage: stage });
            return { stage, count };
        });
        const stages = await Promise.all(stageCountsPromises);

        const recentApps = await Application.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("createdBy", "name");
        
        const recentActivities = recentApps.map(app => {
            return `Application for ${app.studentName} created by ${app.createdBy ? app.createdBy.name : 'Agent'}`;
        });

        if (recentActivities.length === 0) {
            recentActivities.push("No activities registered yet.");
        }

        return res.status(200).json({
            stats: [
                { title: 'Total Applications', value: totalApplications, icon: 'pi pi-file' },
                { title: 'Active Agents', value: activeAgentsCount, icon: 'pi pi-users' },
                { title: 'Pending QA Reviews', value: pendingQaCount, icon: 'pi pi-check-circle' },
                { title: 'Pending Visa Reviews', value: pendingVisaCount, icon: 'pi pi-globe' }
            ],
            stages,
            recentActivities
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id)
            .populate("createdBy", "name email")
            .populate("agentId", "name email");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Compute dynamic available contextual actions
        const availableActions = actionsService.getAvailableActions(application, req.user.role);

        // Generate AI readiness assessment dynamically for review stages
        let aiAssessment = null;
        if (["QA_REVIEW", "APP_REVIEW"].includes(application.currentStage)) {
            aiAssessment = await aiService.generateReadinessAssessment(application);
        }

        return res.status(200).json({
            message: "Application fetched successfully",
            application: {
                ...application.toObject(),
                availableActions,
                aiAssessment
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

// Update Application Stage with Strict State Machine & Gating Rules
router.patch("/:id/stage", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        if (!stage) {
            return res.status(400).json({ message: "Stage is required" });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const currentStage = application.currentStage;

        // 1a. State Machine Check (Is transition valid?)
        const allowedNextStages = VALID_TRANSITIONS[currentStage] || [];
        if (!allowedNextStages.includes(stage) && currentStage !== stage) {
            return res.status(400).json({
                message: `Invalid stage transition from ${currentStage} to ${stage}. Allowed: ${allowedNextStages.join(", ")}`
            });
        }

        // 1c. Role Permissions check for stage transitions
        if (req.user.role !== "ADMIN") {
            const roleRules = ROLE_TRANSITIONS[req.user.role];
            if (!roleRules) {
                return res.status(403).json({ message: "Your role is not authorized to transition applications" });
            }
            if (!roleRules.allowedFrom.includes(currentStage) || !roleRules.allowedTo.includes(stage)) {
                return res.status(403).json({
                    message: `Role ${req.user.role} is not permitted to transition application from ${currentStage} to ${stage}`
                });
            }
        }

        // 1b. Gating Business Rules
        // Rule 1: Cannot transition from QA_REVIEW to APP_REVIEW unless passport and academic documents are verified
        if (currentStage === "QA_REVIEW" && stage === "APP_REVIEW") {
            const passportDoc = application.documents.find(d => d.key === "passport");
            const academicDoc = application.documents.find(d => d.key === "academic");
            
            if (!passportDoc || !passportDoc.verified || !academicDoc || !academicDoc.verified) {
                return res.status(400).json({
                    message: "Precondition failed: Passport and Academic documents must be uploaded and verified before moving to App Review"
                });
            }
        }

        // Rule 2: Cannot transition from APP_REVIEW to DECISION unless at least one review note exists from ADMISSION_OFFICER
        if (currentStage === "APP_REVIEW" && stage === "DECISION") {
            const hasReviewNote = application.notes.some(n => n.role === "ADMISSION_OFFICER");
            if (!hasReviewNote) {
                return res.status(400).json({
                    message: "Precondition failed: An Admission Officer must record a review note before moving to Decision stage"
                });
            }
        }

        // Enforce transition
        application.currentStage = stage;
        await application.save();

        return res.status(200).json({
            message: "Application stage updated successfully",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Add Application Note
router.post("/:id/notes", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { text, visibility, addedByName, role } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Note text is required" });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const newNote = {
            text,
            visibility: visibility || "PUBLIC",
            addedByName: addedByName || req.user.name || "System",
            role: role || req.user.role || "SYSTEM",
            addedBy: req.user.id,
            createdAt: new Date()
        };

        application.notes.push(newNote);
        await application.save();

        return res.status(201).json({
            message: "Note added successfully",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Verify Application Document
router.patch("/:id/documents/:docKey/verify", authMiddleware, async (req, res) => {
    try {
        const { id, docKey } = req.params;
        const { verified } = req.body;

        if (verified === undefined) {
            return res.status(400).json({ message: "Verified state (true/false) is required" });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const docIndex = application.documents.findIndex(d => d.key === docKey);
        if (docIndex === -1) {
            return res.status(404).json({ message: "Document not found" });
        }

        application.documents[docIndex].verified = verified;
        application.documents[docIndex].verifiedBy = req.user.id;
        application.documents[docIndex].verifiedAt = new Date();

        await application.save();

        return res.status(200).json({
            message: "Document verification status updated",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// General Update Application
router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const application = await Application.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).populate("createdBy", "name email");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({
            message: "Application updated successfully",
            application
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Delete Application
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findByIdAndDelete(id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({
            message: "Application deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;