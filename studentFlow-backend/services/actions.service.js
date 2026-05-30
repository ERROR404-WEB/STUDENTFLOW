const { ROLES } = require("../models/enums");

class ActionsService {
    getAvailableActions(application, userRole) {
        const stage = application.currentStage;
        const actions = [];

        // Agents have highly restricted contextual actions
        if (userRole === ROLES.AGENT) {
            if (["NEW_APP", "QA_REVIEW"].includes(stage)) {
                actions.push("WITHDRAW");
            }
            return actions;
        }

        // 1. Refund: Available only post-Deposit
        if (["DEPOSIT", "CAS_REVIEW", "ENROLMENT", "COMPLETED"].includes(stage)) {
            actions.push("REFUND");
        }

        // 2. Drop Out: Available only post-Enrolment
        if (["ENROLMENT", "COMPLETED"].includes(stage)) {
            actions.push("DROP_OUT");
        }

        // 3. Change Course: Available pre-Deposit
        if (["NEW_APP", "QA_REVIEW", "APP_REVIEW", "DECISION"].includes(stage)) {
            actions.push("CHANGE_COURSE");
        }

        // 4. Defer: Available before complete
        if (!["COMPLETED", "APP_REJECTED", "CLOSED_LOST"].includes(stage)) {
            actions.push("DEFER");
        }

        // 5. Cancel: Available for active cases
        if (!["COMPLETED", "APP_REJECTED", "CLOSED_LOST"].includes(stage)) {
            actions.push("CANCEL");
        }

        return actions;
    }
}

module.exports = new ActionsService();
