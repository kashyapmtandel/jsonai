export const sampleJson = `{
  "name": "JSON AI",
  "version": "1.0.0",
  "description": "The ultimate online JSON toolkit",
  "features": [
    "Format & Beautify",
    "Validate",
    "Convert",
    "Diff & Compare",
    "Path Finder",
    "Schema Generator",
    "Tree Viewer",
    "AI Assistant",
    "Escape & Unescape"
  ],
  "author": {
    "name": "Developer",
    "email": "dev@jsonai.online",
    "website": "https://jsonai.online"
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
    "email": "alice@jsonai.online",
    "role": "Admin",
    "active": true
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "email": "bob@jsonai.online",
    "role": "Editor",
    "active": true
  },
  {
    "id": 3,
    "name": "Charlie Brown",
    "email": "charlie@jsonai.online",
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
