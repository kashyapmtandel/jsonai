export const sampleJson = `{
  "name": "JSON Tools",
  "version": "1.0.0",
  "description": "The ultimate online JSON toolkit",
  "features": [
    "Format & Beautify",
    "Validate",
    "Convert",
    "Diff & Compare",
    "Path Finder",
    "Schema Generator",
    "Tree Editor",
    "AI Assistant",
    "Escape & Unescape"
  ],
  "author": {
    "name": "Developer",
    "email": "dev@example.com",
    "website": "https://jsontools.dev"
  },
  "stats": {
    "tools": 9,
    "users": 50000,
    "rating": 4.9
  },
  "isOpenSource": true,
  "lastUpdated": "2024-01-15T10:30:00Z"
}`;

export const sampleJsonArray = `[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Admin",
    "active": true
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "email": "bob@example.com",
    "role": "Editor",
    "active": true
  },
  {
    "id": 3,
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "role": "Viewer",
    "active": false
  }
]`;

export const sampleNestedJson = `{
  "company": {
    "name": "TechCorp",
    "founded": 2010,
    "departments": [
      {
        "name": "Engineering",
        "head": "Jane Doe",
        "employees": 150,
        "projects": [
          { "name": "Project Alpha", "status": "active", "budget": 500000 },
          { "name": "Project Beta", "status": "completed", "budget": 300000 }
        ]
      },
      {
        "name": "Marketing",
        "head": "John Smith",
        "employees": 80,
        "projects": [
          { "name": "Campaign X", "status": "active", "budget": 200000 }
        ]
      }
    ]
  }
}`;

export const sampleInvalidJson = `{
  "name": "Invalid JSON",
  "items": [1, 2, 3,],
  missing_quotes: true
}`;
