const mongoose = require("mongoose");
const { STAGES } = require("./enums");

const NotesSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String
    },
    addedByName: {
        type: String
    },
    visibility: {
        type: String,
        enum: ["PUBLIC", "INTERNAL"],
        default: "PUBLIC"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DocumentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    },
    fileUrl: {
        type: String
    },
    mimeType: {
        type: String,
        default: "application/pdf"
    },
    uploaded: {
        type: Boolean,
        default: false
    },
    uploadedAt: {
        type: Date
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    verifiedAt: {
        type: Date
    }
});

const applicationSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: [true, "Student name is required"],
            trim: true
        },

        studentEmail: {
            type: String,
            required: [true, "Student email is required"],
            lowercase: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        nationality: {
            type: String,
            required: [true, "Nationality is required"],
            trim: true
        },

        courseName: {
            type: String,
            required: [true, "Course is required"],
            trim: true
        },

        universityName: {
            type: String,
            required: [true, "University is required"],
            trim: true
        },

        intakeYear: {
            type: Number,
            required: true,
            default: new Date().getFullYear()
        },

        intakeMonth: {
            type: String,
            enum: ["January", "May", "September"],
            default: "September"
        },

        currentStage: {
            type: String,
            enum: Object.values(STAGES),
            default: STAGES.NEW_APP
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        documents: {
            type: [DocumentSchema],
            default: [
                {
                    key: "passport",
                    name: "Passport",
                    uploaded: false
                },
                {
                    key: "academic",
                    name: "Academic Documents",
                    uploaded: false
                },
                {
                    key: "englishTest",
                    name: "English Test / IELTS",
                    uploaded: false
                },
                {
                    key: "sop",
                    name: "Statement of Purpose",
                    uploaded: false
                },
                {
                    key: "cv",
                    name: "CV / Resume",
                    uploaded: false
                }
            ]
        },

        agentNote: {
            type: String,
            trim: true
        },

        notes: {
            type: [NotesSchema],
            default: []
        },

        depositPaid: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);