# project_beyondPlus_backend

## 📁 Project Structure
<pre>
.  
|-- README.md  
|-- <b>UploadFiles</b> 
|-- app.js  
|-- <b>config</b>  
|    |-- database.js 
|    `-- passport.js  
|  
|-- <b>middleware</b> 
|   `-- authenticateToken.js  
|-- package-lock.json  
|-- package.json  
|-- <b>routes</b>  
|    |-- auth.js  
|    |-- comments.js  
|    |-- login.js  
|    |-- posts.js  
|    |-- timetables.js  
|    `-- uploadFiles.js  
`-- views  
    |-- comments.ejs  
    |-- login.ejs  
    |-- posts.ejs  
    `-- timetables.ejs</pre>

## ⚙️ Server Structure
```mermaid
graph TD;
    App[Frontend App] --> Server[App Server];
    Server --> main_user[user_ubuntu];
    Server --> test_user[user_test];
    main_user --> main_Node[Node.js :3000];
    main_user --> main_DB[PostgreSQL Database :3000];
    test_user --> test_Node[Node.js :???];
    test_user --> test_DB[PostgreSQL Database :???];
```

## 🚩 Git Branch Structure
```mermaid
graph TD;
    A[Main Branch]
    B[Develop Branch]
    C[Feature Branch]
    D[Hotfix Branch]

    A --> B  
    B --> C 
    A --> D 
    C --> B 
    D --> A 
    D --> B 

    subgraph Workflow
        direction LR
        A[Main] --> D[Hotfix]
        B[Develop] --> C[Feature]
    end
```

1. **Main Branch**:
   - Stable, production-ready code.
   - Only releases and critical hotfixes are merged into this branch.

2. **Develop Branch**:
   - Integration branch for features and hotfixes.
   - Reflects the latest development state.

3. **Feature Branches**:
   - Created for new features.
   - Originates from the `Develop` branch.
   - Merges back into `Develop` once complete.

4. **Hotfix Branches**:
   - Created for urgent fixes in production.
   - Originates from the `Main` branch.
   - Merges into both `Main` and `Develop` to keep the branches up to date.

