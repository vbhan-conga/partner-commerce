pipeline {
    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
    }
        
    agent none

    stages {
        
        stage("UI Package CI") {
                    stages {
                        stage('Build-linuxAgent'){
                            agent {
                        kubernetes {
            label 'conga-ui-builder-v1'
            defaultContainer 'jnlp'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    name: conga-ui-builder-v1
spec:
  containers:
  - name: ic-ui-builder
    image: art01-ic-devops.jfrog.io/ic-ui-builder:14.9
    command:
    - cat
    tty: true
    imagePullPolicy: Always
  - name: ic-tag-builder
    image: art01-ic-devops.jfrog.io/ic-tag-builder:1.x
    command:
    - cat
    tty: true
  - name: ic-docker-builder
    image: art01-ic-devops.jfrog.io/ic-docker-builder:17.03.0-ce
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: host-file
    imagePullPolicy: Always
  volumes:
  - name: host-file
    hostPath:
      path: /var/run/docker.sock
      type: File
  imagePullSecrets:
  - name: devops-docker-secret
  """
}
}
                            steps {
                                script {
                                    propertiesPath="./CICDAutomation/build.properties"
                                    jenkinsFilePath="."
                                    (jenkinsFilePath == "") ? jenkinsFilePath="./":""
                                    
                                    sh "ls -lrt"

                                    uiServiceProps=readProperties file: propertiesPath

                                    //Fetch Inputs from build.properties file
                                    channel=uiServiceProps['CHANNEL']

                                    uiCiServiceEnabled="TRUE"
                                    uiCiServiceEnabledPropsInfo=uiServiceProps['AIC_UI_SERVICE_CI_ENABLED']
                                    if(uiCiServiceEnabledPropsInfo){
                                        uiCiServiceEnabled=uiCiServiceEnabledPropsInfo.toUpperCase()
                                    }

                                    if( uiCiServiceEnabled == "TRUE") {

                                        aicJenkinsArtifactoryCredId=uiServiceProps.AIC_JENKINS_ARTIFACTORY_CREDS_ID
                                        aicJenkinsBitbucketCredId=uiServiceProps.AIC_JENKINS_BITBUCKET_CREDS_ID

                                        //Check ci-skip in the last commit message
                                        ciskipResult = checkCISkip(jenkinsFilePath, channel, aicJenkinsBitbucketCredId)
                                        if(ciskipResult == "TRUE") {
                                            currentBuild.result = 'ABORTED'
                                            return
                                        }

                                        sendCommitIdMsgInfo(jenkinsFilePath, channel, aicJenkinsBitbucketCredId)

                                        //Execute npm instal in the build context path to install modules
                                        npmInstallPath = uiServiceProps['AIC_UI_BUILD_CONTEXT_PATH']
                                        installNpmPackages(npmInstallPath, channel, aicJenkinsArtifactoryCredId)
                                        
                                        // Update Patch Version
                                        updateNpmPackagePatchVersion(npmInstallPath, channel)
                                        
                                        //Execute build package and test command
                                        // buildPackgeCommand="npm run build" //Default Command
                                        // buildPackgeCommandPropsInput = uiServiceProps['AIC_UI_BUILD_PKG_CMD'].toString()
                                        // if(buildPackgeCommandPropsInput){
                                        //     buildPackgeCommand=buildPackgeCommandPropsInput //Override defaut command
                                        // }
                                        // createBuildPackage(npmInstallPath, channel, buildPackgeCommand)

                                        buildUiServiceCommandCount=uiServiceProps["AIC_UI_SERVICE_BUILD_CMD_COUNT"].toInteger()
                                        def buildUiServiceCommands = []
                                        for(int i = 0;i<buildUiServiceCommandCount;i++){
                                            buildUiServiceCommands[i]=i
                                        }

                                        buildUiServiceCommands.each { buildUiServiceCommandIndex ->
                                            buildUiServiceCommand='AIC_UI_SERVICE_BUILD_CMD_' + "${buildUiServiceCommandIndex}"
                                            buildUiServiceCommand=uiServiceProps[buildUiServiceCommand]
                                            executeCustomBuildPackageCmd(npmInstallPath, channel, buildUiServiceCommand, "${buildUiServiceCommandIndex}")
                                        }

                                        // pacakge name
                                        uiServicePackageName=uiServiceProps['AIC_UI_SERVICE_PACAKGE_NAME']
                                        // Folder containing package.json for a specific ui project
                                        uiServicePackgeJsonFolderPath=uiServiceProps['AIC_UI_SERVICE_PACKAGEJSON_FOLDER_PATH']
                                        // Folder Path to the ui pacakge that gets created in the ng build process
                                        uiServicePackgePath=uiServiceProps['AIC_UI_SERVICE_PACKAGE_PATH']
                                        // Create the artifactory ui package
                                        npmServicePackageVersion=createNpmPackage(uiServicePackageName, uiServicePackgeJsonFolderPath, uiServicePackgePath, channel)
                                        // Publish the artifactory ui package on npm registry
                                        publishNpmPackage(aicJenkinsArtifactoryCredId, uiServicePackageName, npmServicePackageVersion, channel)

                                        sendNotifications("INFO","${channel}","CICD", "Successfully Published pacakage : ${uiServicePackageName} of version : ${npmServicePackageVersion}")
                                        //========================================================================

                                        tagEnabled=uiServiceProps["ENABLE_TAGGING"].toUpperCase()
                                        if(tagEnabled == "TRUE"){
                                            //Tag Git repo
                                            pushUpdatedPackageJson=uiServiceProps["ENABLE_AUTOMATIC_PATCH_VERSION"].toString().toUpperCase()
                                            tagGitRepoAndPushUpdatedPackageJson(npmServicePackageVersion, aicJenkinsBitbucketCredId, channel, pushUpdatedPackageJson, npmInstallPath)
                                            sendNotifications("WARN","${channel}","CICD", "Git repo is tagged with the version ${npmServicePackageVersion}")

                                        }

                                        //Build and Package Deployable UI package
                                        uiServiceCdEnabled=uiServiceProps["AIC_UI_SERVICE_CD_ENABLED"].toUpperCase()

                                        if(uiServiceCdEnabled == "TRUE"){
                                            //downstream jobs
                                            uiServiceDownstreamJobs=uiServiceProps['DOWNSTREAM_JOBS']

                                            if(uiServiceDownstreamJobs) {
                                                println "Triggering downstream job for deployment of package ${uiServicePackageName} of version ${npmServicePackageVersion}"
                                                def downstreamJobs=uiServiceDownstreamJobs.split(',')

                                                triggerDownStreamJobs(channel, downstreamJobs, npmServicePackageVersion, uiServicePackageName)
                                            }
                                        }
                                        
                                        sendNotifications("INFO","${channel}","CICD", "Successfully Completed.")
                                        
                                    } else {
                                        //Send msg on channel that CI is disabled.
                                        sendNotifications("WARN","${channel}","CICD", "CI id disabled!!")
                                    }
                                
                                }
                            }
                        }
                        
                    }
                }
    }// Stages     
}// Pipeline


void installNpmPackages(String packageJsonFolderPath, String slackChannelName, String aicJenkinsArtifactoryCredId) {
    
    try {
        stage('NPM-Install') {
            container('ic-ui-builder') {
                withCredentials([usernamePassword(credentialsId: "${aicJenkinsArtifactoryCredId}", passwordVariable: 'apikey', usernameVariable: 'username')]) {
                    sh """
                        make npm-install ARTIFACTORY_USERNAME=${username} ARTIFACTORY_PASSWORD=${apikey} PACKAGEJSON_FOLDERPATH=${packageJsonFolderPath}
                    """
                }
            }
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","NPM-Install")
        throw error
    }  
}

void updateNpmPackagePatchVersion(String packageJsonFolderPath, String slackChannelName) {
    
    try {
        stage('Update-Version') {
            container('ic-ui-builder') {
                sh "git config --global user.email 'apttusengrxuser@conga.com'"
                sh "git config --global user.name 'apttusengrxuser-conga'"
                sh "make npm-version-update-patch PACKAGEJSON_FOLDERPATH=$packageJsonFolderPath"
            }
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Update-Version")
        throw error
    }  
}

void createBuildPackage(String packageJsonFolderPath, String slackChannelName, String packageCommand) {
    
    try{
        stage('Build-Package') {                
            container('ic-ui-builder') {
                sh "make build-package PACKAGEJSON_FOLDERPATH=${packageJsonFolderPath} PACKAGE_CMD='$packageCommand'"            
            }
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Build-Package")
        throw error
    } 
}

void executeCustomBuildPackageCmd(String packageJsonFolderPath, String slackChannelName, String packageCommand, String cmdIndex) {
    
    try{
        stage("Custom-Cmd-${cmdIndex}") {
            container('ic-ui-builder') {
                sh "make execute-custom-cmd PACKAGEJSON_FOLDERPATH=${packageJsonFolderPath} PACKAGE_CMD='$packageCommand'"            
            }
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Custom-Cmd-${cmdIndex}")
        throw error
    } 
}

String createNpmPackage(String uiPackageName, String packageJsonFolderPath, String uiPackgePath, String slackChannelName) {
    
    try{
        stage("Package-${uiPackageName}"){
            container('ic-ui-builder'){
                sh "make create-npm-package PACKAGEJSON_FOLDERPATH=${packageJsonFolderPath} PACKAGE_NAME=${uiPackageName} PACKAGE_PATH='${uiPackgePath}'"
                packageJsonVersionProps = readProperties file: "packageVersion.properties"
                packageJsonVersion = packageJsonVersionProps['PACKAGE_VERSION']
            }
        }
        return packageJsonVersion
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Package-${uiPackageName}")
        throw error
    }
}

void publishNpmPackage(String aicJenkinsArtifactoryCredId, String uiPackageName, String uiPackageVersion, String slackChannelName ) {
    
    try{
        stage("Publish-${uiPackageName}"){
            withCredentials([usernamePassword(credentialsId: "${aicJenkinsArtifactoryCredId}", passwordVariable: 'ARTIFACTORY_PASSWORD', usernameVariable: 'ARTIFACTORY_USERNAME')]) {
                container('ic-ui-builder'){
                    sh """
                        make publish-npm-package ARTIFACTORY_USERNAME=${ARTIFACTORY_USERNAME} ARTIFACTORY_PASSWORD=${ARTIFACTORY_PASSWORD} PACKAGE_NAME=${uiPackageName} PACKAGE_VERSION=${uiPackageVersion}
                    """
                }
            }
            sendNotifications("INFO","${slackChannelName}","Publish-Artifact", "PUSHED PACKAGE VERSION: ${uiPackageVersion} of UI : ${uiPackageName}")
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Publish-${uiPackageName}")
        throw error
    }
}

void tagGitRepoAndPushUpdatedPackageJson(String packageJsonVersion, String aicJenkinsBitbucketCredId, String slackChannelName, String pushUpdatedPackageJson, String packageJsonFolderPath) {
    
    try{
        stage('Git Tag'){
            withCredentials(bindings: [sshUserPrivateKey(credentialsId: "${aicJenkinsBitbucketCredId}", keyFileVariable: 'AIC_SSH_KEY_LOCATION' )]) {
                container('ic-tag-builder'){
                    sh "make git-tag-and-push-package-json AIC_SSH_KEY_LOCATION=${AIC_SSH_KEY_LOCATION} PACKAGE_JSON_VERSION=${packageJsonVersion} PUSH_PACKAGE=${pushUpdatedPackageJson} PACKAGE_JSON_FOLDER_PATH=${packageJsonFolderPath}"
                }
            }
        }
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","Git Tag")
        throw error
    }
}

void triggerDownStreamJobs(String slackChannelName, def downstreamJobs, String version, String packageName) {

    
    stage('Downstream-Jobs') {
        if(downstreamJobs) {
            for (downstreamJob in downstreamJobs) {
                try {
                    def jobResult = build(
                                        job: "${downstreamJob}",
                                        parameters: [
                                            string(name: 'VERSION', value: "${version}"), 
                                            string(name: 'PACKAGE_NAME', value: "${packageName}")],
                                        wait: false
                                        )
                } catch (error) {
                    sendNotifications("Failure","${slackChannelName}","Downstream-Job ${downstreamJob}")
                }
            }
        }
    }
}

@NonCPS
def currentBuildHasChangeSetsLog(){
    def changeLogSets = currentBuild.changeSets
    changeLogSetsSize=changeLogSets.size()
    if(changeLogSetsSize == 0){
        return "FALSE"
    } else {
        return "TRUE"
    }
}

String evaluateCISkip(String jenkinsFilePath, String slackChannelName, String aicJenkinsBitbucketCredId) {

    ciSkip="FALSE"
    ciSkipPropertyFileName="ciskip"
    try{
        withCredentials(bindings: [sshUserPrivateKey(credentialsId: "${aicJenkinsBitbucketCredId}", keyFileVariable: 'AIC_SSH_KEY_LOCATION' )]) {
            container('ic-tag-builder'){
                sh "make evaluate-ci-skip AIC_SSH_KEY_LOCATION=${AIC_SSH_KEY_LOCATION} PROPERTY_FILE_NAME=${ciSkipPropertyFileName}"
                ciSkipProp = readProperties file: "${jenkinsFilePath}/${ciSkipPropertyFileName}.properties"
                ciSkip = ciSkipProp['CI_SKIP']
                println "ci-skip for current execution is : ${ciSkip}"
            }
        }
        return ciSkip
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","CICD")
        throw error
    }
}

String checkCISkip(String jenkinsFilePath, String slackChannelName, String aicJenkinsBitbucketCredId){
    try {
        stage('Check ci-skip'){
            def hasChangeSetLogs = currentBuildHasChangeSetsLog()
            if(hasChangeSetLogs == "TRUE"){
                ciskipResult = evaluateCISkip(jenkinsFilePath, slackChannelName, aicJenkinsBitbucketCredId)
                if(ciskipResult == "TRUE") {
                    return "TRUE"
                } else {
                    return "FALSE"
                }
            } else {
                //for manual trigger and downstream trigger.
                return "FALSE"
            }
        }
    } catch (error) {
        sendNotifications("Failure","${slackChannelName}","Check ci-skip")
        throw error
    }
}

void sendCommitIdMsgInfo(String jenkinsFilePath, String slackChannelName, String aicJenkinsBitbucketCredId) {
    
    commitInfoPropFileName = "commitInfo"
    commitInfo = "No Info Available"
    try{
        withCredentials(bindings: [sshUserPrivateKey(credentialsId: "${aicJenkinsBitbucketCredId}", keyFileVariable: 'AIC_SSH_KEY_LOCATION' )]) {
            container('ic-tag-builder'){
                sh "make get-commit-info AIC_SSH_KEY_LOCATION=${AIC_SSH_KEY_LOCATION} PROPERTY_FILE_NAME=${commitInfoPropFileName}"
                commitInfoTemp = readProperties file: "${jenkinsFilePath}/${commitInfoPropFileName}.properties"
                if(commitInfoTemp){
                    commitInfo = commitInfoTemp
                }
                println "Commit Info for current execution is : ${commitInfo}"
            }
        }
        sendNotifications("INFO","${slackChannelName}","CICD", "${commitInfo}")
    }
    catch (error) {
        sendNotifications("Failure","${slackChannelName}","CICD")
    }
}

def sendNotifications(String buildStatus = 'INFO', String channel, String stageName, String additinalMsg = "" ) {

  def colorName = 'RED'
  def colorCode = '#FF0000'
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${currentBuild.displayName}]'"
  def summary = "${subject} \n Job Name: '${env.JOB_NAME} \n Build Number: [${currentBuild.displayName}]' \n Build URL: (${env.BUILD_URL}) \n Stage Name: ${stageName} \n Additional Info: ${additinalMsg}"
  def details = """<p>${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
    <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>"""
  if (buildStatus == 'WARN') {
    color = 'ORANGE'
    colorCode = '#FF4000'
  } else if (buildStatus == 'DEBUG') {
    color = 'GREY'
    colorCode = '#848484'
  } 
  else if (buildStatus == 'INFO') {
    color = 'GREEN'
    colorCode = '#00FF00'
  }
  else if (buildStatus == 'Failure') {
    color = 'RED'
    colorCode = '#FF0000'
  } else {
    color = 'BLACK'
    colorCode = '#000000'
  }

  
/*
  hipchatSend (color: color, notify: true, message: summary)

  emailext (
      to: 'bitwiseman@bitwiseman.com',
      subject: subject,
      body: details,
      recipientProviders: [[$class: 'DevelopersRecipientProvider']]
    )
*/

//Send notification on MSFT Teams 
//Default channel is cicd-alert group
  webhookChannel="https://outlook.office.com/webhook/85806430-022c-47e1-8176-89f479fb2cbd@3a41ae53-fb35-4431-be7b-a0b3e1aee3c0/JenkinsCI/29fef30a618c47c7ad729bd0f9937c65/b97b5136-db72-4aad-a314-e7d4a765a878"
  
  if(channel.contains("https://outlook.office.com/webhook")){
    webhookChannel=channel
  } else {
    //Notify on Slack
    slackSend (color: colorCode,channel: channel, message: summary)
  }
  //Notify on MSFT TEAMS
  office365ConnectorSend message: summary,status:buildStatus,webhookUrl:webhookChannel,color: colorCode 
}



/**
  * Generates a path to a temporary file location, ending with {@code path} parameter.
  * 
  * @param path path suffix
  * @return path to file inside a temp directory
  */
@NonCPS
String createTempLocation(String jenkinsFilePath, String path) {
  String tmpDir = pwd tmp: true
  def workspace = env.WORKSPACE + File.separator + jenkinsFilePath
  return workspace + File.separator + new File(path).getName()
}

/**
  * Returns the path to a temp location of a script from the global library (resources/ subdirectory)
  *
  * @param srcPath path within the resources/ subdirectory of this repo
  * @param destPath destination path (optional)
  * @return path to local file
  */
String copyGlobalLibraryScript(String jenkinsFilePath, String srcPath, String destPath = null) {
  destPath = destPath ?: createTempLocation(jenkinsFilePath, srcPath)
  writeFile file: destPath, text: libraryResource(srcPath)
  echo "copyGlobalLibraryScript: copied ${srcPath} to ${destPath}"
  return destPath
}