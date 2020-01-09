set -eo pipefail

function LOG_INFO()
{
    LOG_MESSAGE_LINE="`date +%Y-%m-%d-%H:%M:%S` [INFO]  $1"
    echo -e  $LOG_MESSAGE_LINE
}

#------------------------------------------------------------------#
# Function Name: LOG_ERROR
# Description: This method is used for printing ERROR logs
#------------------------------------------------------------------#
function LOG_ERROR()
{
    LOG_MESSAGE_LINE="`date +%Y-%m-%d-%H:%M:%S` [ERROR] $1 "
    echo -e $LOG_MESSAGE_LINE
    exit 1
}

function npm_install {
    packageJSON_Folder=${1}
    LOG_INFO "PackageJSON Folder $packageJSON_Folder"
    cd $packageJSON_Folder
    rm -rf node_modules
    LOG_INFO "NPM Install"
    npm install
}

function npm_version_update_patch {
    packageJSON_Folder=${1}
    LOG_INFO "PackageJSON Folder $packageJSON_Folder"
    cd $packageJSON_Folder
    LOG_INFO "Update version"
    git config --global user.email 'DevOps-J2B-ibm@apttus.com'
    git config --global user.name 'ic-cicd'
    npm version patch -m "Updated to patch version: %s with auto increment with Jenkins job. [ci skip]"
    git status
}

function build_package {
    packageJSON_Folder=${1}
    packageCmd="${2}"
    LOG_INFO "PackageJSON Folder $packageJSON_Folder"
    cd $packageJSON_Folder
    LOG_INFO "Packaging.."
    LOG_INFO "Package commad: ${packageCmd}"
    #npm install typescript@3.5.3
    #npm install -g @angular/cli@7.3.9
    if [[ ! -z "$packageCmd" ]]; then
        $packageCmd
    else
        gulp package
    fi
}

function execute_custom_cmd {
    packageJSON_Folder=${1}
    packageCmd="${2}"
    LOG_INFO "PackageJSON Folder $packageJSON_Folder"
    cd $packageJSON_Folder
    LOG_INFO "Executing build and pacakge cmd..."
    LOG_INFO "Package commad: ${packageCmd}"
    if [[ ! -z "$packageCmd" ]]; then
        $packageCmd
    fi
}

function create_npm_package {
    packageJSON_Folder=${1}
    packageName=${2}
    packageFilesAndFolders="${3}"

    packageJsonPath="$packageJSON_Folder/package.json"
    npmPackageVersion=$(node -p -e "require('$packageJsonPath').version")

    mkdir package

    if [[ ! -z "$packageFilesAndFolders" ]]; then
        cp -rf $packageFilesAndFolders package/
    fi

    tar -zcvf $packageName-$npmPackageVersion.tgz package

    echo "PACKAGE_VERSION=$npmPackageVersion" > packageVersion.properties
    rm -rf package
}

function publish_npm_package {
    artifactoryURL=${1}
    artifactory_Cred=${2}
    artifactoryTargetRep=${3}
    branch=${4}
    packageName=${5}
    packageVersion=${6}

    artifactorySubRepo=$packageName
    localPath="$packageName-$packageVersion.tgz"

    BRANCH_NAME=$(echo $branch| cut -d'/' -f 2)
    LOG_INFO "Artifactory Branch name is $BRANCH_NAME"
    LOG_INFO "Uploading file $localPath"
    curl -u ${artifactory_Cred} -X PUT ${artifactoryURL}/${artifactoryTargetRep}/${artifactorySubRepo}/${BRANCH_NAME}/ \
	-T ${localPath}
}

function git_tag_repo_and_update_pacakge_json {

    AIC_SSH_KEY_LOCATION=${1}
    PACKAGE_JSON_VERSION=${2}
    branch=${3}
    PUSH_PACKAGE=${4}
    PACKAGE_JSON_FOLDER_PATH=${5}

    AIC_TAG_NAME="${PACKAGE_JSON_VERSION}"
    PACKAGE_JSON_PATH="${PACKAGE_JSON_FOLDER_PATH}/package.json"
    PACKAGE_LOCK_JSON_PATH="${PACKAGE_JSON_FOLDER_PATH}/package-lock.json"

    test ${PACKAGE_LOCK_JSON_PATH} && echo "package.json file exists"
    test ${PACKAGE_LOCK_JSON_PATH} && echo "packag-lock.json file exists"

    git config --global user.email "DevOps-J2B-ibm@apttus.com"
    git config --global user.name "ic-cicd"

    #Add tag
    git tag -l ${AIC_TAG_NAME}
    git tag -a -f -m "Updated patch version [ci skip]" ${AIC_TAG_NAME}

    GIT_SSH_COMMAND="ssh  -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i ${AIC_SSH_KEY_LOCATION}" git push origin ${AIC_TAG_NAME}

    #push updated package.json to the git repo head
    if [[ $PUSH_PACKAGE == "TRUE" ]]; then
        LOG_INFO "Pushing the updated package.json file in the origing:head"
        GIT_SSH_COMMAND="ssh  -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i ${AIC_SSH_KEY_LOCATION}" git push origin HEAD:${branch}
    fi
    LOG_INFO "Successfully Tagged with Tag ${AIC_TAG_NAME}"
}

function evaluate_ci_skip {
    AIC_SSH_KEY_LOCATION=${1}
    COMMIT_ID_SHA=${2}
    PROPERTY_FILE_NAME=${3}

    git config --global user.email "DevOps-J2B-ibm@apttus.com"
    git config --global user.name "ic-cicd"

    ciSkipKey="[ci skip]"

    msg=$(git log --format=%B -n 1 ${COMMIT_ID_SHA})

    LOG_INFO "Successfully obtained the commit messages on commitid: ${COMMIT_ID_SHA}"
    LOG_INFO "commit messages : ${msg}"

    if [[ $msg == *"$ciSkipKey"* ]]; then
        echo "CI_SKIP=TRUE" > ${PROPERTY_FILE_NAME}.properties
        LOG_INFO "returned ci skip as TRUE"
    else
        echo "CI_SKIP=FALSE" > ${PROPERTY_FILE_NAME}.properties
        LOG_INFO "returned ci skip as false"
    fi

}

function get_commit_info {
    AIC_SSH_KEY_LOCATION=${1}
    COMMIT_ID_SHA=${2}
    PROPERTY_FILE_NAME=${3}

    git config --global user.email "DevOps-J2B-ibm@apttus.com"
    git config --global user.name "ic-cicd"

    msg=$(git log --format=%B -n 1 ${COMMIT_ID_SHA})

    LOG_INFO "Successfully obtained the commit messages on commitid: ${COMMIT_ID_SHA}"
    LOG_INFO "commit messages : ${msg}"

    echo "$msg" > ${PROPERTY_FILE_NAME}.properties

}
