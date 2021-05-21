node{
    stage('Scm checkout'){
        def gitexec = tool name: 'Default', type: 'git'
        git branch: 'master', credentialsId: 'cap10-github', url: 'https://github.com/TatendaKwaramba/ussd.git'
    }
    stage('Build docker image'){
        sh 'docker-compose build --no-cache --force-rm'
        }
    stage('tagging image'){
    sh 'docker tag ussd-agent:latest cap10/myrepository:ussd-agent'
    }
   stage('Push new image'){
      withCredentials([string(credentialsId: 'docker-pwd', variable: 'dockerHubPwd')]) {
           // some block
            sh "docker login -u cap10 -p ${dockerHubPwd}"
            }
            sh 'docker push cap10/myrepository:ussd-agent'
        }


        stage ('Pull image'){
        sshagent(['akupay-server']) {
        def dockerPull ='docker pull cap10/myrepository:ussd-agent'
        sh "ssh -o StrictHostKeyChecking=no venon@138.68.87.244 ${dockerPull}"

        }
    }
}