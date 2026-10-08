sed -i '1s/^/import { useCallback } from "react";\n/' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
sed -i 's/const fetchJobs = async () => {/const fetchJobs = useCallback(async () => {/g' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
sed -i 's/    } catch (err) {/    } catch (err) {/g' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
sed -i 's/    }\n  };\n\n  useEffect/    }\n  }, []);\n\n  useEffect/g' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
