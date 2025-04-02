# Introduction

This is a copy of my 2024 UNSW capstone team project. Inspired by the capstone project course itself, this is a web application that helps schools manage course data, and group students into teams to take on available course projects.

Summary of functionality: 
* **Students** → Add skills to own profile, join course pages created by admins, form groups with other students.
* **Course admins & other academics** → Create course pages, upload course projects, assign groups to projects based off skill compatibility. Admins can opt to use the matching algorithm or manually assign groups to projects.

Written in Vite + JS + MongoDB. Containerized with Docker.

## Individual Contributions

I was the backend developer for this project. I designed the API, database system, and backend testing suites.

## OpenAI keys
We were required to integrate LLM capabilities into our capstone project. We used this for skill analysis in our system. 

OpenAI API keys have been removed from in this version: in `backend/algos/group_recommending/project_scp.js` and `backend/algos/group_recommending/student_scp.js`. The skill analysis system will not work without valid API key replacements.

## Screenshots
1. __Login Page__
   
   ![image](https://github.com/user-attachments/assets/1638189c-9a19-4173-a76a-9a71b76b589c)

2. __Dashboard__

   ![image](https://github.com/user-attachments/assets/45b79a4f-946c-49aa-b512-d47f7c7ae9b3)

3. __Course Page Creation__

   ![image](https://github.com/user-attachments/assets/cfa26a99-7979-432a-be78-969f2f07760e)

4. __Student Page__

   ![image](https://github.com/user-attachments/assets/f77a45ff-d14e-4834-baea-c112c8f542df)

5. __Group-Project Assignments__
 
   ![image](https://github.com/user-attachments/assets/1bac9640-333b-40fc-a540-4cd9ac23b97a)

---

Original `README.md` text as below.

# Installation Manual 

1. To run this site, you must have the docker desktop app installed and running 

2. In a terminal window, ensure you are in the root folder of the source code, titled captone-project-3900t11aerror404 

3. Run the command `docker compose build` (without the quotation marks). This may take a few moments 

4. Once this is complete, run the command `docker compose up –d`. Again, this may take a few moments 

5. In a web browser, open `http://localhost:4000` 

6. Click on ‘Go to Login In’ then ‘Sign Up’ 

7. Enter details to register a site admin account 

8. When you wish to shut down the server, run `docker compose down` in the terminal. 

# User Guide 

## Site Admin 

The first account you register will be the site admin account. You can use this account to manage all activity on the site. From the admin tab in the header, you can change user permissions or remove users. Within courses the site admin has the same privileges of creation, editing and deletion as course admin. You can also use this account to elevate other accounts to site admin status. 

## Joining 

The site will open to a welcome page, click on the ‘Go to Log In’ button, and then ‘Sign Up’ to create a new account. You must register with an education email ending in .edu.au 

Once registered you can view your profile and the courses dashboard. 

From your profile you may edit your details or delete your account. 

From the courses dashboard you may either join a course or create a course. If you create a course, you will be the course admin, however if you wish to join a pre-exiting course you will need to be given the join code by a course admin. Once you are in a course, the available functionality depends on your role, as outlined below. 

## Course Admin 

Course admin may remove students from their course and edit or delete all groups or projects created in their course. They may also create groups and projects.  

They will need to pass on the course join codes to those they wish to join the course. Students may thus verify that they have received the code from the correct source. These codes can be seen and changed on the admin’s dashboard. 

There are three types of join codes, for students, academics, and admin. The student join code will allow the user to add skills to their profile, form groups with other students, view projects and select preferences. The academic join code allows the user to create projects, but not view the student groups (until they have been assigned a group to work with). If the course admin requires another course admin to help manage the course, they may use the admin join code. 

At the bottom of their dash the course admin can run a matching algorithm to assign groups to projects, make any changes to the suggested matching, and then confirm the assignment. 

## Academic 

An academic has access to the project features. Using the header bar, they can navigate to the projects page to create a new project. When they create the project, they can specify the maximum number of groups they are able to support. 

Once a project is created, the academic can edit or delete it, add the skills students will need to undertake it, and add other academics to help manage the project. 

Once the course admin has confirmed group allocations, the academic can see any groups that have been assigned to their project, along with the groups aggregated skills and the students’ skills and courses. 

## Student 

On their dashboard students can see groups or projects which are recommended based on their or their group’s skills. 

In the header bar they can navigate to the groups, projects, or profile. 

On the profile page they can add skills to their profile. 

On the groups page they can see any public groups other students have created, along with a skills breakdown of the group, and of its members. The student can join a group. 

They can also choose to create a group. If they create a public group, any other student can see and join it. If they create a private group, they can select students to add, and only students in the group will be able to see it. The owner of a public or private group can remove group members. 

The group owner can also set up to seven project preferences here, and once projects have been assigned a group’s assigned project will appear on their group page. 

On the projects page, students can see all the projects which have been created in the course and select a project to view its details and the clients’ contact details. They can also see a comparison of their group’s skills with the project’s required skills.
