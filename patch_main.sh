sed -i '/\]/ {
    /\]/!b
    /\])$/!b
    s/\]/    \,\n    {\n        path: "\*",\n        element: <Navigate to="\/" replace \/>,\n    }\n\]/
}' comprova-frontend/src/main.tsx
