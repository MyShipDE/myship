pipeline {
	agent any

	options {
		disableConcurrentBuilds()
	}

	parameters {
		booleanParam(name: 'CLEAN_WORKSPACE', defaultValue: true, description: 'Should clean the WorkSpace before Build?')
	}

	stages {
		stage('Prepare') {
			when {
				expression { params.CLEAN_WORKSPACE == true }
			}
			steps {
				cleanWs()
				checkout scm
			}
		}
	}
}