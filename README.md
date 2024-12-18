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
