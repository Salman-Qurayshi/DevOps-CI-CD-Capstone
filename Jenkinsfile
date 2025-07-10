pipeline {
    agent any

    environment {
        // Replace with your Docker Hub username
        DOCKER_HUB_USERNAME = 'salmanalqureshi' // Change this to your Docker-hub username
        IMAGE_NAME = 'node-express-app'
        SONAR_SCANNER_HOME = tool 'SonarScanner' // Name of SonarQube Scanner tool configured in Jenkins
        SONARQUBE_SERVER_NAME = 'SonarQube' // Name of SonarQube server configured in Jenkins
    }

    tools {
        // Ensure Node.js is available on the Jenkins agent for 'npm install'
        nodejs 'NodeJS 18.x' // Name of NodeJS tool configured in Global Tool Configuration
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "--- Checking out source code ---"
                git branch: 'main', url: 'https://github.com/Salman-Qurayshi/DevOps-CI-CD-Capstone.git'
                // Make sure you change the url to your own Github repo
            }
        }

        stage('Build Application (npm install)') {
            steps {
                echo "--- Installing Node.js dependencies ---"
                sh 'npm install'
            }
        }

        stage('Unit Tests') {
            steps {
                echo "--- Running Unit Tests in Docker Container ---"
                script {
                    sh 'docker-compose -f docker-compose.test.yml build unit-tests'
                    sh 'docker-compose -f docker-compose.test.yml run --rm unit-tests'
                }
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                echo "--- Performing Static Code Analysis with SonarQube ---"
                withSonarQubeEnv(SONARQUBE_SERVER_NAME) {
                    sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=${env.JOB_NAME} \
                        -Dsonar.projectName=${env.JOB_NAME} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_AUTH_TOKEN} || true"
                }
            }
        }

        stage('Quality Gate Check') {
            steps {
                echo "--- Waiting for SonarQube Quality Gate result ---"
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "SonarQube Quality Gate failed with status: ${qg.status}"
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "--- Building Docker application image ---"
                script {
                    // Build the main application image
                    def appImage = docker.build "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                    appImage.tag "latest" // Also tag with latest
                }
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                echo "--- Scanning Docker image for vulnerabilities with Trivy ---"
                script {
                    // Run Trivy against the newly built image
                    // Make sure Trivy image is up-to-date and accessible
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest \
                        image ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                    // Consider adding --exit-code 1 --severity CRITICAL,HIGH to fail the build on critical vulnerabilities
                }
            }
        }

        stage('Integration Tests') {
            steps {
                echo "--- Running Integration Tests in Docker Container ---"
                script {
                    // Bring up the integration-app and integration-tests services
                    sh 'docker-compose -f docker-compose.test.yml up -d integration-app'
                    // Give the app a moment to start up
                    sh 'sleep 10' // Increased sleep for potentially slower startup
                    // Run the integration tests
                    sh 'docker-compose -f docker-compose.test.yml run --rm integration-tests'
                }
            }
            post {
                always {
                    echo "--- Tearing down Integration Test containers ---"
                    sh 'docker-compose -f docker-compose.test.yml down' // Clean up containers after tests
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo "--- Pushing Docker image to Docker Hub ---"
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        docker.image("${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${env.BUILD_NUMBER}").push()
                        docker.image("${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "--- Deploying application to Staging Environment ---"
                sh 'chmod +x deploy.sh'
                // Execute the deploy script
                sh './deploy.sh'
            }
        }

        stage('Post-Deployment Validation (Smoke & Performance Tests)') {
            steps {
                echo "--- Running Smoke Tests ---"
                // Give the deployed app a moment to stabilize
                sh 'sleep 15' // Increased sleep for potentially slower startup
                sh 'curl -f http://localhost/ || curl -f http://localhost/api/status'
                sh 'curl -f http://localhost/api/status | grep "running"'

                echo "--- Running Performance Tests (Apache Bench) ---"
                // Requires 'apache2-utils' to be installed on the Jenkins agent
                sh 'sudo apt install -y apache2-utils || true' // Install ab if not present. `|| true` prevents build failure if already installed.
                sh 'ab -n 100 -c 10 http://localhost/ || true' // 100 requests, 10 concurrent
            }
        }
    }

    post {
        always {
            echo "--- Pipeline Finished ---"
            // Clean up any dangling Docker images/containers that might accumulate
            sh 'docker system prune -f --volumes || true' // --volumes also removes unused volumes
        }
        success {
            echo "Pipeline Succeeded!"
            // Optional: Send success email notification (requires emailext plugin setup)
            // emailext (
            //     subject: "Jenkins Build ${env.JOB_NAME} - #${env.BUILD_NUMBER} SUCCESS",
            //     body: "Build URL: ${env.BUILD_URL}",
            //     to: "your_email@example.com"
            // )
        }
        failure {
            echo "Pipeline Failed!"
            // Optional: Send failure email notification
            // emailext (
            //     subject: "Jenkins Build ${env.JOB_NAME} - #${env.BUILD_NUMBER} FAILED",
            //     body: "Build URL: ${env.BUILD_URL}",
            //     to: "your_email@example.com"
            // )
        }
        cleanup {
            // This block runs regardless of success/failure, useful for final cleanup
            echo "--- Post-build cleanup actions ---"
        }
    }
}