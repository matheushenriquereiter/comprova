sed -i 's/const fetchJobs = async () => {/async function fetchJobs() {/g' comprova-frontend/src/pages/dashboard/CandidateAvailableJobs.tsx
sed -i 's/const fetchApplications = async () => {/async function fetchApplications() {/g' comprova-frontend/src/pages/dashboard/CandidateDashboard.tsx
sed -i 's/const fetchQuestions = async () => {/async function fetchQuestions() {/g' comprova-frontend/src/pages/dashboard/CandidateTest.tsx
sed -i 's/const fetchJobPosting = async () => {/async function fetchJobPosting() {/g' comprova-frontend/src/pages/dashboard/JobPostingCandidates.tsx
sed -i 's/const fetchJobPostings = async () => {/async function fetchJobPostings() {/g' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
