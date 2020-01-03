#--------------------------------------------------------------------------------------------------------------#
# Summary: This Makefile does following things:
# - Verifies if all the configuration values are set
# - install: Downloads and installs packages for the project (Artifactory is used has NPM Private Registry)
# - update: Update the Package Version. Appends Build Number has 4th Octate
# - package: Gulp Package
# - build: Build the Docker Image
# - check: Check the image is present in Artifactory Docker Registry. If yes, Throw an error
# - push: Push the image in to Artifactory Docker Registry
# - tag: Tag the Repository
# - clean: Remove the image and dist folder from local
#--------------------------------------------------------------------------------------------------------------#
include CICDAutomation/build.properties
SHELL := /bin/bash
export $(shell cat CICDAutomation/build.properties)

INFO=$(shell echo `date +%Y-%m-%d-%H:%M:%S` [INFO])
ERROR=$(shell echo `date +%Y-%m-%d-%H:%M:%S` [ERROR])
WARN=$(shell echo `date +%Y-%m-%d-%H:%M:%S` [WARN])

define check_var_defined
$(if $(1),,$(error $(2) is not defined))
endef

check-npmrc-defined:
	$(call check_var_defined,$(AIC_ARTIFACTORY_NPM_REG_URL),AIC_ARTIFACTORY_NPM_REG_URL)
	$(call check_var_defined,$(ARTIFACTORY_USERNAME),ARTIFACTORY_USERNAME)
	$(call check_var_defined,$(ARTIFACTORY_PASSWORD),ARTIFACTORY_PASSWORD)
	$(call check_var_defined,$(AIC_ARTIFACTORY_EMAIL),AIC_ARTIFACTORY_EMAIL)

configure-npm: | check-npmrc-defined
	@echo $(INFO) Configure NPMRC file
	$(eval ARTIFACTORY_CREDS = $(shell echo -n $(ARTIFACTORY_USERNAME):$(ARTIFACTORY_PASSWORD) | base64 ))
	@cp npmrc ~/.npmrc
	@sed -i 's,ARTIFACTORY_NPM_REG_URL,$(AIC_ARTIFACTORY_NPM_REG_URL),g' ~/.npmrc
	@sed -i 's/ARTIFACTORY_EMAIL/$(AIC_ARTIFACTORY_EMAIL)/g' ~/.npmrc
	@sed -i 's/ARTIFACTORY_CREDS/$(ARTIFACTORY_CREDS)/g' ~/.npmrc

check-build-defined:
	$(call check_var_defined,$(AIC_ARTIFACTORY_URL),AIC_ARTIFACTORY_URL)
	$(call check_var_defined,$(ARTIFACTORY_USERNAME),ARTIFACTORY_USERNAME)
	$(call check_var_defined,$(ARTIFACTORY_PASSWORD),ARTIFACTORY_PASSWORD)
	$(call check_var_defined,$(AIC_ARTIFACTORY_TARGET_REPO),AIC_ARTIFACTORY_TARGET_REPO)
	$(call check_var_defined,$(GIT_BRANCH),GIT_BRANCH)

check-git-defined:
	$(call check_var_defined,$(AIC_SSH_KEY_LOCATION),AIC_SSH_KEY_LOCATION)

npm-install: configure-npm
	@source make_script.sh; npm_install $(PACKAGEJSON_FOLDERPATH)

npm-version-update-patch:
	$(call check_var_defined,$(BUILD_NUMBER),BUILD_NUMBER)
	@source make_script.sh; npm_version_update_patch $(PACKAGEJSON_FOLDERPATH)

build-package:
	@echo "$(INFO) executing the package command: $(PACKAGE_CMD)"
	@source make_script.sh; build_package $(PACKAGEJSON_FOLDERPATH) "$(PACKAGE_CMD)"

execute-custom-cmd:
	@echo "$(INFO) executing the custom build and package command: $(PACKAGE_CMD)"
	@source make_script.sh; execute_custom_cmd $(PACKAGEJSON_FOLDERPATH) "$(PACKAGE_CMD)"

create-npm-package: 
	@source make_script.sh; create_npm_package $(PACKAGEJSON_FOLDERPATH) $(PACKAGE_NAME) "$(PACKAGE_PATH)"

publish-npm-package: | check-build-defined
	@source make_script.sh; publish_npm_package $(AIC_ARTIFACTORY_URL) $(ARTIFACTORY_USERNAME):$(ARTIFACTORY_PASSWORD) \
			$(AIC_ARTIFACTORY_TARGET_REPO) $(GIT_BRANCH) $(PACKAGE_NAME) $(PACKAGE_VERSION)

git-tag-and-push-package-json: | check-git-defined
	@echo $(INFO) BitBucket Git Tag
	@source make_script.sh; git_tag_repo_and_update_pacakge_json $(AIC_SSH_KEY_LOCATION) $(PACKAGE_JSON_VERSION) $(BRANCH_NAME) $(PUSH_PACKAGE) $(PACKAGE_JSON_FOLDER_PATH)
	@echo $(INFO) Published Tag Successfully

evaluate-ci-skip:
	@source make_script.sh; evaluate_ci_skip $(AIC_SSH_KEY_LOCATION) $(GIT_COMMIT) $(PROPERTY_FILE_NAME)

get-commit-info:
	@source make_script.sh; get_commit_info $(AIC_SSH_KEY_LOCATION) $(GIT_COMMIT) $(PROPERTY_FILE_NAME)

all: npm-install npm-version-update-patch gulp-package create-npm-package publish-npm-package git-tag-and-push-package-json

.PHONY: npm-install npm-version-update-patch build-package create-npm-package publish-npm-package git-tag-and-push-package-json all
