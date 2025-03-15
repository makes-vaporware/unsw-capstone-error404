# Installation Manual 

1. To run this site, you must have the docker desktop app installed and running 

2. In a terminal window, ensure you are in the root folder of the source code, titled captone-project-3900t11aerror404 

3. Run the command ‘docker compose build’ (without the quotation marks). This may take a few moments 

4. Once this is complete, run the command ‘docker compose up –d'. Again, this may take a few moments 

5. In a web browser, open ‘http://localhost:4000’ 

6. Click on ‘Go to Login In’ then ‘Sign Up’ 

7. Enter details to register a site admin account 

8. When you wish to shut down the server, run ‘docker compose down’ in the terminal. 

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

 [![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=15162823&assignment_repo_type=AssignmentRepo)
