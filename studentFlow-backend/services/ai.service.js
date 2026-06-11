const https = require("https");

class AIService {
    constructor() {
        this.provider = (process.env.AI_PROVIDER || "MOCK").toUpperCase();
        this.timeout = parseInt(process.env.AI_TIMEOUT || "5000");
    }

    async generateReadinessAssessment(application) {
        const prompt = this.buildPrompt(application);

        try {
            if (this.provider === "OPENAI") {
                return await this.callOpenAI(prompt);
            } else if (this.provider === "ANTHROPIC") {
                return await this.callAnthropic(prompt);
            } else {
                return await this.generateMockResponse(application);
            }
        } catch (error) {
            console.error("AI Service Error:", error.message);
            return {
                readiness: "UNKNOWN",
                missingDocuments: ["System was unable to perform AI check at this time."],
                risks: [`AI Advisory offline: ${error.message}`],
                isAdvisoryOnly: true
            };
        }
    }

    buildPrompt(application) {
        return `
            You are an expert Admissions AI assistant for GSP Platform.
            Evaluate the student application for eligibility:
            Student Name: ${application.studentName}
            Course: ${application.courseName}
            University: ${application.universityName}
            Documents Uploaded: ${(application.documents || []).map(d => `${d.name} (${d.verified ? 'Verified' : 'Pending'})`).join(", ")}

            Provide a JSON output containing:
            1. "readiness": "High" | "Medium" | "Low"
            2. "missingDocuments": Array of missing items required for this course.
            3. "risks": Array of academic or eligibility risks (e.g. English test requirements).
        `;
    }

    makeHttpsRequest(options, postData) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error("Failed to parse JSON response"));
                        }
                    } else {
                        reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on("error", (err) => reject(err));

            req.setTimeout(this.timeout, () => {
                req.destroy();
                reject(new Error("Request timed out"));
            });

            if (postData) {
                req.write(JSON.stringify(postData));
            }
            req.end();
        });
    }

    async callOpenAI(prompt) {
        const options = {
            hostname: "api.openai.com",
            path: "/v1/chat/completions",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            }
        };

        const postData = {
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        };

        const result = await this.makeHttpsRequest(options, postData);
        return JSON.parse(result.choices[0].message.content);
    }

    async callAnthropic(prompt) {
        const options = {
            hostname: "api.anthropic.com",
            path: "/v1/messages",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            }
        };

        const postData = {
            model: "claude-3-opus",
            messages: [{ role: "user", content: prompt }]
        };

        const result = await this.makeHttpsRequest(options, postData);
        return JSON.parse(result.content[0].text);
    }

    async generateMockResponse(application) {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));

        const missing = [];
        const risks = [];
        let readiness = "High";

        const docs = application.documents || [];
        const hasPassport = docs.some(d => d.key === 'passport');
        const hasAcademic = docs.some(d => d.key === 'academic');
        const hasIelts = docs.some(d => d.key === 'englishTest');

        if (!hasPassport) missing.push("Valid Passport");
        if (!hasAcademic) missing.push("High School / University Academic Transcript");
        if (!hasIelts) {
            missing.push("English Proficiency Test Result");
            risks.push("No IELTS or TOEFL score uploaded. May require pre-sessional English courses.");
            readiness = "Medium";
        }

        if (missing.length > 2) {
            readiness = "Low";
        }

        return {
            readiness,
            missingDocuments: missing.length ? missing : ["None"],
            risks: risks.length ? risks : ["No major risks identified"],
            isAdvisoryOnly: true,
            evaluatedAt: new Date()
        };
    }
}

module.exports = new AIService();
