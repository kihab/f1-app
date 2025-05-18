# CI/CD Pipeline Decision

## What is CI/CD?
CI/CD automates testing, linting, and building the project on every code push, and optionally deploys or publishes artifacts.

## Alternatives Considered

| Platform           | Pros                                     | Cons                    |
|--------------------|------------------------------------------|-------------------------|
| GitHub Actions     | Easiest with GitHub, free, many templates| Only for GitHub repos   |
| GitLab CI          | Powerful, free private, good for GitLab  | Must use GitLab repo    |
| Bitbucket Pipelines| Integrated, simple                       | Bitbucket only          |
| Others             | Extra features/options                   | More config/setup       |

## Decision

**Chosen: GitHub Actions**

**Why:**
- Code hosted (or easily hosted) on GitHub
- Fast setup, huge ecosystem, easy YAML syntax
- Handles all steps: lint, test, build, and (optionally) build/push Docker images
- Used by most open source and personal projects

## When Are We Adding CI/CD? (Timing Decision)

- **In a professional/team production environment:**  
  CI/CD is usually set up early in the project to automate quality checks, speed up feedback, and coordinate work across multiple developers or environments.
- **For this solo project with a tight deadline:**  
  We’re prioritizing core app development (FE, BE, DB) and will add CI/CD as a final step *after* the main features are functional and tested.  
  This allows us to avoid being blocked or distracted by pipeline/debugging while still ensuring best practices before delivery.

**Summary:**  
We will use GitHub Actions for our CI/CD, adding the workflow file once the core project is working and Dockerized.
