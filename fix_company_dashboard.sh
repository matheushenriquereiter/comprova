sed -i '/useEffect(() => {/,/}, \[\]);/c \  useEffect(() => {\n    fetchJobs();\n  }, []);' comprova-frontend/src/pages/dashboard/CompanyDashboard.tsx
