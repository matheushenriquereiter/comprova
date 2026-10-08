# Remove from CandidateAvailableJobs
sed -i '/const WORKPLACE_MAP:/,/};/d' comprova-frontend/src/pages/dashboard/CandidateAvailableJobs.tsx
sed -i '/const EMPLOYMENT_MAP:/,/};/d' comprova-frontend/src/pages/dashboard/CandidateAvailableJobs.tsx
sed -i '1s/^/import { WORKPLACE_MAP, EMPLOYMENT_MAP } from "..\/..\/utils\/constants";\n/' comprova-frontend/src/pages/dashboard/CandidateAvailableJobs.tsx

# Remove from CompanyDashboard
sed -i '/const STATUS_MAP:/,/};/d' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
sed -i '/const WORKPLACE_MAP:/,/};/d' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
sed -i '1s/^/import { STATUS_MAP, WORKPLACE_MAP } from "..\/..\/utils\/constants";\n/' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx

# Remove from CandidateDashboard
sed -i '/const WORKPLACE_MAP:/,/};/d' comprova-frontend/src/pages/dashboard/CandidateDashboard.tsx
sed -i '1s/^/import { WORKPLACE_MAP } from "..\/..\/utils\/constants";\n/' comprova-frontend/src/pages/dashboard/CandidateDashboard.tsx
