export const STAGES = {
    "NEW_APP": "NEW_APP",
    "QA_REVIEW": "QA_REVIEW",
    "APP_REVIEW": "APP_REVIEW",
    "DECISION": "DECISION",
    "DEPOSIT": "DEPOSIT",
    "CAS_REVIEW": "CAS_REVIEW",
    "ENROLMENT": "ENROLMENT",
    "APP_REJECTED": "APP_REJECTED",
    "CLOSED_LOST": "CLOSED_LOST",
    "COMPLETED": "COMPLETED"
}


export const STAGE_NAMES = {
    "NEW_APP": "New Application",
    "QA_REVIEW": "QA Review",
    "APP_REVIEW": "Application Review",
    "DECISION": "Decision Made",
    "DEPOSIT": "Deposit Paid",
    "CAS_REVIEW": "CAS Review",
    "ENROLMENT": "Enrolment",
    "APP_REJECTED": "Application Rejected",
    "CLOSED_LOST": "Closed/Lost",
    "COMPLETED": "Completed"
}


export const ROLES = {
    "ADMIN": "ADMIN",
    "AGENT": "AGENT",
    "QA_OFFICER": "QA_OFFICER",
    "ADMISSION_OFFICER": "ADMISSION_OFFICER",
    "VISA_OFFICER": "VISA_OFFICER",
    "ENROLMENT_OFFICER": "ENROLMENT_OFFICER"
}

export const VALID_TRANSITIONS = {
    "NEW_APP": ["QA_REVIEW", "CLOSED_LOST"],
    "QA_REVIEW": ["APP_REVIEW", "APP_REJECTED", "CLOSED_LOST"],
    "APP_REVIEW": ["DECISION", "APP_REJECTED", "CLOSED_LOST"],
    "DECISION": ["DEPOSIT", "CLOSED_LOST"],
    "DEPOSIT": ["CAS_REVIEW", "CLOSED_LOST"],
    "CAS_REVIEW": ["ENROLMENT", "CLOSED_LOST"],
    "ENROLMENT": ["COMPLETED", "CLOSED_LOST"],
    "APP_REJECTED": [],
    "CLOSED_LOST": [],
    "COMPLETED": []
}

export const ROLE_TRANSITIONS = {
    "QA_OFFICER": {
        allowedFrom: ["NEW_APP", "QA_REVIEW"],
        allowedTo: ["QA_REVIEW", "APP_REVIEW", "APP_REJECTED", "CLOSED_LOST"]
    },
    "ADMISSION_OFFICER": {
        allowedFrom: ["APP_REVIEW", "DECISION"],
        allowedTo: ["DECISION", "DEPOSIT", "APP_REJECTED", "CLOSED_LOST"]
    },
    "VISA_OFFICER": {
        allowedFrom: ["DEPOSIT", "CAS_REVIEW"],
        allowedTo: ["CAS_REVIEW", "ENROLMENT", "CLOSED_LOST"]
    },
    "ENROLMENT_OFFICER": {
        allowedFrom: ["ENROLMENT"],
        allowedTo: ["COMPLETED", "CLOSED_LOST"]
    }
}