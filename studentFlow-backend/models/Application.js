const mongoose = require("mongoose");
const { STAGES } = require("./enums");

const NotesSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
    },
    addedByName: {
        type: String, // Stored for easy display without populating
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const applicationSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
        },
        studentEmail: {
            type: String,
            required: [true, 'Student email is required'],
            lowercase: true,
            trim: true,
        },

        courseName: {
            type: String,
            required: [true, 'Course is required'],
        },

        universityName: {
            type: String,
            required: [true, 'University is required'],
        },

        intakeYear: {
            type: Number,
            default: new Date().getFullYear(),
        },

        intakeMonth: {
            type: String,
            enum: ['January', 'May', 'September'],
            default: 'September',
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

        documents: [
            {
                name: String,
                uploaded: {
                    type: Boolean,
                    default: true
                }
            }
        ],

        notes: {
            type: [NotesSchema],
            default: [],

        },

        depositPaid: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);