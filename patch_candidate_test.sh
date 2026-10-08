# Fix getCandidateTestQuestions
sed -i '/const response = await fetch/,/const data = await response.json();/c \        const data = await JobService.getCandidateTestQuestions(token, Number(id));' comprova-frontend/src/pages/dashboard/CandidateTest.tsx

# Fix submitCandidateTest
sed -i '/const response = await fetch/,/const responseData = await response.json();/c \      const responseData = await JobService.submitCandidateTest(token, Number(id), answers);' comprova-frontend/src/pages/dashboard/CandidateTest.tsx

# Fix missing import if any
sed -i '1s/^/import { JobService } from "..\/..\/services\/jobService";\n/' comprova-frontend/src/pages/dashboard/CandidateTest.tsx

