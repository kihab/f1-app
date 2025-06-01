# f1-app
Full stack F1 World Champions

## what does the app do? first high level 

## Then a very detailed description of the app and what it does and what it offers per component. 

## What do we offer per platform, very detailed description of each platform
    - for exmapl our backend offers a swagger documnetation for out API, mention that 
    - for exmaple our iOS app offers a native app for iPhone no ipad support but we offer support for all iphoen screens,....etc 

## Tech Stack
- iOS App: Swift
- Backend: Node.js, Express, Prisma, PostgreSQL
- CI/CD: GitHub Actions
- Containerization: Docker, Docker Compose
- Caching: Redis


## dependencies section:
    - should explain the dependencies of the BE app high level maybe even just the name and then refere to the dependencies.md file for more details, it has extensive details about the BE dependencies
    - the iOS doesn't have any third party dependencies , it was intentional to keep it simple and clean and we didn't need any third party dependencies specifically to achieve the goal of the app.
    

## Folder Structure section:
    - should explain in detailed the folder structure of the whole repo in details what does ech folder contain and does each file contain and what does each exactly do 
    - the pipeline docs is inside hte infrastructure folder - notice that - 
    - make sure to explain that all the MD files that ends with "initial_architecture_decision" are the initial decisions we made, initials resrach, tradoffs, and there files are only there to document the initial decisions and my line of thoughts when I started the project and that they are mostly not matching the final decisions and the current final implementation is docuemnt in the other MD files per topic separated.
    - explain that a file like this one "high_level_system_architecture_flowchart.md" has a mermaid diagram that shows the high level architecture of the app and that it is a static image that is generated from the mermaid code in the file.and its best to view it in github.com as it supports mermaid and it will render the diagram correctly. there is also a screenshot of that diagram incase you want to view it directly wihtout using github.com or another viewer.

## The how to section :
- how to run the app locally, docker compose up and speciics on how to run ios app 

- how to run the docker compose make sure docker desktop is running

- how to open the swagger documentation for the backend, which URL

- how to open the pgAdmin for the backend, which URL

- how to run the ios app:

- how to run the tests, both backend and ios app tests and how/where to see the test results and code coverage - Ask me if you didn't know how from the reading the Code base - and also mention that the io piplie generate artiifact tests results bundle and upload it to github actions and that you can download unpack and open it in Xcode and view the test results and code coverage.

- how to run the ci/cd pipeline both backend and ios app pipeline, whic URL, add Github actions URL


## High level architecture section:
    - of the app 
    - tradd off, high level becayse we trad off document inother files in details , refer to it.
    - API Contract high level and refer to our API md file under backend folder 



